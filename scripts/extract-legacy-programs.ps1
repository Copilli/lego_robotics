$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
function Read-Entry($zip,$entry){$r=[IO.StreamReader]::new($entry.Open(),[Text.Encoding]::UTF8);try{return $r.ReadToEnd()}finally{$r.Dispose()}}
function Diagram($diagram,$document,$seen=@()){
  if($seen -contains $diagram.GetAttribute('Id')){throw 'Cyclic diagram reference'}
  $seen+= $diagram.GetAttribute('Id')
  $nodes=@();$wires=@()
  $children=@($diagram.ChildNodes | ForEach-Object {if($_.LocalName -like '*.BuiltInMethod'){$_.ChildNodes}else{$_}})
  foreach($child in $children){
    if($child.NodeType -ne 'Element'){continue}
    if($child.LocalName -eq 'Terminal'){continue}
    if($child.LocalName -eq 'Wire'){$wires+=@{id=$child.GetAttribute('Id');joints=$child.GetAttribute('Joints')};continue}
    $args=@();$terminals=@();$diagrams=@()
    foreach($terminal in $child.SelectNodes('./*[local-name()="ConfigurableMethodTerminal"]')){
      $inner=$terminal.SelectSingleNode('./*[local-name()="Terminal"]')
      if($inner){$args+=@{name=$inner.GetAttribute('Id');value=$terminal.GetAttribute('ConfiguredValue');wire=$inner.GetAttribute('Wire');type=$inner.GetAttribute('DataType');direction=$inner.GetAttribute('Direction')}}
    }
    foreach($terminal in $child.SelectNodes('./*[local-name()="Terminal"]')){$terminals+=@{name=$terminal.GetAttribute('Id');wire=$terminal.GetAttribute('Wire');direction=$terminal.GetAttribute('Direction')}}
    foreach($nested in $child.SelectNodes('./*[local-name()="BlockDiagram"]')){$diagrams+=,(Diagram $nested $document $seen)}
    foreach($attribute in $child.Attributes | Where-Object {$_.Name -match 'DiagramId$'}){
      $nested=$document.SelectSingleNode('//*[local-name()="BlockDiagram" and @Id="'+$attribute.Value+'"]')
      if($nested){$diagrams+=,(Diagram $nested $document $seen)}
    }
    if($child.LocalName -eq 'ConfigurableWhileLoop'){$diagrams+=,(Diagram $child $document @())}
    $nodes+=@{id=$child.GetAttribute('Id');kind=$child.LocalName;role=$child.ParentNode.GetAttribute('CallType');target=$child.GetAttribute('Target');args=$args;terminals=$terminals;diagrams=$diagrams;bounds=$child.GetAttribute('Bounds');attributes=@($child.Attributes | ForEach-Object {@{name=$_.Name;value=$_.Value}})}
  }
  return @{name=$diagram.GetAttribute('Name');nodes=$nodes;wires=$wires}
}
$catalogPath=Join-Path $PSScriptRoot '../public/content/catalog.json'
$inventoryPath=Join-Path $PSScriptRoot '../.preservation/curriculum-inventory.json'
$catalog=Get-Content -LiteralPath $catalogPath -Raw -Encoding UTF8 | ConvertFrom-Json
$inventory=Get-Content -LiteralPath $inventoryPath -Raw -Encoding UTF8 | ConvertFrom-Json
$results=@()
foreach($activity in $inventory.activities | Where-Object {$_.source -and $_.id -like 'legacy-*'}){
  $zip=[IO.Compression.ZipFile]::OpenRead($activity.source)
  try{
    $brickAssets=@{}
    foreach($asset in $zip.Entries | Where-Object {$_.FullName -match '\.(rsf|rgf)$'}){
      $stream=$asset.Open();$memory=[IO.MemoryStream]::new()
      try{$stream.CopyTo($memory);$bytes=$memory.ToArray();$hasher=[Security.Cryptography.SHA256]::Create();try{$hash=([BitConverter]::ToString($hasher.ComputeHash($bytes))).Replace('-','').ToLower()}finally{$hasher.Dispose()};$relative='assets/'+$hash.Substring(0,20)+[IO.Path]::GetExtension($asset.FullName).ToLower();[IO.File]::WriteAllBytes((Join-Path $PSScriptRoot ('../public/content/'+$relative)),$bytes);$brickAssets[[IO.Path]::GetFileNameWithoutExtension($asset.FullName)]=$relative}finally{$stream.Dispose();$memory.Dispose()}
    }
    $programs=@()
    foreach($entry in $zip.Entries | Where-Object {$_.FullName -like '*.ev3p'}){
      [xml]$xml=Read-Entry $zip $entry
      $root=$xml.SelectSingleNode('//*[local-name()="BlockDiagram" and @Name="__RootDiagram__"]')
      if($root){$d=Diagram $root $xml;if($d.nodes.Count -gt 1){$programs+=@{name=$entry.FullName;diagram=$d}}}
    }
    $slides=@()
    $activityEntry=$zip.GetEntry('Activity.x3a')
    if($activityEntry){[xml]$x=Read-Entry $zip $activityEntry;foreach($slide in $x.SelectNodes('//*[local-name()="Slide"]')){
      $slides+=@{name=$slide.GetAttribute('SlideName');images=@($slide.SelectNodes('.//*[local-name()="img"]') | ForEach-Object {$_.GetAttribute('src')});actions=@($slide.SelectNodes('.//*[local-name()="buttonimage"]') | ForEach-Object {$_.GetAttribute('action')});text=$slide.InnerText}
    }}
    $results+=@{activityId=$activity.id;programs=$programs;slides=$slides;brickAssets=$brickAssets}
  }finally{$zip.Dispose()}
}
$target=Join-Path $PSScriptRoot '../.preservation/legacy-programs.json'
[IO.File]::WriteAllText($target,($results | ConvertTo-Json -Depth 100),[Text.UTF8Encoding]::new($false))
Write-Output "Extracted programs for $($results.Count) activities."
