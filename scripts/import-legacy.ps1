$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$outputRoot = Join-Path $PSScriptRoot '../public/content'
$assets = Join-Path $outputRoot 'assets'
$catalogPath = Join-Path $outputRoot 'catalog.json'
$catalog = Get-Content -LiteralPath $catalogPath -Raw -Encoding UTF8 | ConvertFrom-Json
$catalog.units=@($catalog.units | Where-Object {$_.id -notlike 'legacy-*' -and $_.id -notlike 'robot-legacy-*'})
foreach($unit in $catalog.units){$unit.activities=@($unit.activities | Where-Object {$_ -notlike 'legacy-*'})}
$catalog.activities=@($catalog.activities | Where-Object {$_.id -notlike 'legacy-*'})
$catalog.manuals=@($catalog.manuals | Where-Object {$_.id -notlike 'manual-legacy-*'})
function Copy-Asset($file) {
  if (-not $file -or -not (Test-Path -LiteralPath $file -PathType Leaf)) { return $null }
  $hash = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLower()
  $target = 'assets/' + $hash.Substring(0,20) + [IO.Path]::GetExtension($file).ToLower()
  if(-not (Test-Path -LiteralPath (Join-Path $outputRoot $target))){Copy-Item -LiteralPath $file -Destination (Join-Path $outputRoot $target)}
  return $target
}
function Read-Entry($zip,$name) {
  $entry = $zip.GetEntry($name)
  if (-not $entry) { return '' }
  $reader = [IO.StreamReader]::new($entry.Open(),[Text.Encoding]::UTF8)
  try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}
function Plain-Text($value) { return [System.Net.WebUtility]::HtmlDecode(($value -replace '<[^>]+>',' ' -replace '\s+',' ').Trim()) }
function Resolve-Asset($name,$bases,$nested) {
  if(-not $name){return $null}
  foreach($base in $bases){$result=Copy-Asset (Join-Path $base $name);if($result){return $result}}
  if($nested){
    $entry=$nested.GetEntry($name)
    if($entry){
      $stream=$entry.Open();$memory=[IO.MemoryStream]::new()
      try{$stream.CopyTo($memory);$bytes=$memory.ToArray();$hasher=[Security.Cryptography.SHA256]::Create();try{$hash=([BitConverter]::ToString($hasher.ComputeHash($bytes))).Replace('-','').ToLower()}finally{$hasher.Dispose()};$target='assets/'+$hash.Substring(0,20)+[IO.Path]::GetExtension($name).ToLower();if(-not (Test-Path -LiteralPath (Join-Path $outputRoot $target))){[IO.File]::WriteAllBytes((Join-Path $outputRoot $target),$bytes)};return $target}finally{$stream.Dispose();$memory.Dispose()}
    }
  }
  return $null
}
$sources = @(
  @{root='C:/Program Files (x86)/LEGO Software/LEGO MINDSTORMS EV3 Home Edition/Resources/ContentPacks/Retail/en-US/LEGO'; packs=@(0,1,2,3,4); group='home'},
  @{root='C:/Program Files (x86)/LEGO Software/LEGO MINDSTORMS Edu EV3/Resources/ContentPacks/Education/es/LEGO'; packs=@(0,3,5); group='base'}
)
$mediaPath = Join-Path $PSScriptRoot '../public/media/lego-local/catalog.json'
$media = @()
if(Test-Path -LiteralPath $mediaPath){$mediaCatalog=Get-Content -LiteralPath $mediaPath -Raw -Encoding UTF8 | ConvertFrom-Json;$media=$mediaCatalog.entries;if(-not $media){$media=$mediaCatalog}}
foreach($source in $sources) {
  foreach($number in $source.packs) {
    $folder = Join-Path $source.root "pack$number"
    $nonlocalized = $folder -replace '[\\/](es|en-US)[\\/]','/nonlocalized/'
    $id = "legacy-$($source.group)-$number"
    $group = $source.group
    if($source.group -eq 'base' -and $number -eq 5){$group='expansion'}
    if($source.group -eq 'base' -and $number -eq 3){$group='workshops'}
    $unit = @{id=$id;title=$(if($group -eq 'home'){'Home'}elseif($group -eq 'expansion'){'Robots del set de expansión'}else{'Modelos educativos'});summary='Misiones e instrucciones conservadas de la aplicación instalada.';group=$group;activities=@();image=$null}
    $unit.image=Copy-Asset (Join-Path $nonlocalized 'assets/3.png')
    if($group -eq 'workshops'){$unit.title='Taller de robótica';$unit.group='classroom'}
    foreach($file in Get-ChildItem -LiteralPath (Join-Path $folder 'projects') -Filter '*.ev3' -ErrorAction SilentlyContinue) {
      $zip = [IO.Compression.ZipFile]::OpenRead($file.FullName)
      $nested=$null;$nestedMemory=$null
      try {
        $nestedEntry=$zip.GetEntry('ActivityAssets.laz')
        if($nestedEntry){$nestedMemory=[IO.MemoryStream]::new();$nestedStream=$nestedEntry.Open();try{$nestedStream.CopyTo($nestedMemory)}finally{$nestedStream.Dispose()};$nestedMemory.Position=0;$nested=[IO.Compression.ZipArchive]::new($nestedMemory)}
        $title = Read-Entry $zip '___ProjectTitle'
        if(-not $title){continue}
        $activityXml = Read-Entry $zip 'Activity.x3a'
        if(-not $activityXml){continue}
        [xml]$activity = $activityXml
        $thumbnail = Read-Entry $zip '___LinkProjectThumbnail'
        $image = $null
        foreach($base in @($file.DirectoryName,(Join-Path $nonlocalized 'projects'))) {if(-not $image){$image=Copy-Asset (Join-Path $base $thumbnail)}}
        $steps = @()
        $buildImages = @()
        foreach($slide in $activity.SelectNodes('//*[local-name()="Slide"]')) {
          if($group -eq 'home' -and $slide.GetAttribute('SlideName') -notmatch '^(Brief|Build|Program|Go)\d+$'){continue}
          $texts = @($slide.SelectNodes('.//*[local-name()="RichTextDocument"]') | ForEach-Object { Plain-Text $_.OuterXml })
          $stepImage=$null
          $stepVideo=$null
          foreach($node in $slide.SelectNodes('.//*[local-name()="SimpleData"]')) {
            foreach($attribute in $node.Attributes) {
              if($attribute.Name -eq 'VideoFileName'){
                $videoSource=(Join-Path (Join-Path $nonlocalized 'projects') $attribute.Value)
                $relativeVideo=($videoSource -replace '\\','/') -replace '^.*?/Resources/','Resources/'
                $relativeVideo=$relativeVideo -replace '/+','/'
                $record=$media | Where-Object {($_.sourcePath -replace '\\','/') -eq $relativeVideo} | Select-Object -First 1
                if($record -and $record.browserPlayable){$stepVideo='../media/lego-local/'+$(if($record.webFile){$record.webFile}else{$record.file})}
              }
              if($attribute.Name -match '^ImageKey\d+$|^ImageOverlayFileName$|^ImageFileName$') {
                $candidate=Resolve-Asset $attribute.Value @($file.DirectoryName,(Join-Path $nonlocalized 'projects')) $nested
                if($candidate){if(-not $stepImage){$stepImage=$candidate};if($attribute.Name -match '^ImageKey'){$buildImages+=$candidate}}
              }
            }
          }
          foreach($img in $slide.SelectNodes('.//*[local-name()="img"]')) {
            if($img.GetAttribute('width') -and [int]$img.GetAttribute('width') -lt 100){continue}
            $src=$img.GetAttribute('src')
            if(-not $src){continue}
            foreach($base in @($file.DirectoryName,(Join-Path $nonlocalized 'projects'))) {
              $candidate=Resolve-Asset $src @($base) $nested
              if($candidate){if(-not $stepImage){$stepImage=$candidate};if($slide.GetAttribute('SlideName') -match 'Build'){$buildImages+=$candidate};break}
            }
          }
          $description = ($texts | Select-Object -Skip 1) -join ' '
          if($description -or $stepImage){$steps+=@{id="step-$($steps.Count)";title=$(if($texts.Count){$texts[0]}else{$title});description=$description;image=$stepImage;video=$stepVideo;manualIds=@();toolbox=@()}}
        }
        if(-not $steps.Count){continue}
        $activityId="$id-$($file.BaseName -replace '[^a-zA-Z0-9_-]','-')"
        $activityUnitId=$id
        if($group -eq 'base'){
          $modelNumber=$(if($file.BaseName -match 'Gyro'){1}elseif($file.BaseName -match 'Color'){2}elseif($file.BaseName -match 'Puppy'){3}else{4})
          $activityUnitId="robot-core-$modelNumber"
          $existingUnit=$catalog.units | Where-Object {$_.id -eq $activityUnitId} | Select-Object -First 1
          if($existingUnit){$existingUnit.activities+= $activityId}
        }
        if($group -eq 'expansion'){
          $activityUnitId="robot-$activityId"
          $catalog.units+=@{id=$activityUnitId;title=$title.Trim();summary='Construye y programa este robot del set de expansión.';group='expansion';image=$image;activities=@($activityId)}
        }
        if($buildImages.Count){
          $manualId="manual-$activityId"
          $catalog.manuals+=@{id=$manualId;title=$title;image=$image;images=@($buildImages | Select-Object -Unique);stepCount=$buildImages.Count}
          foreach($step in $steps){$step.manualIds=@($manualId)}
        }
        $catalog.activities+=@{id=$activityId;unitId=$activityUnitId;title=$title.Trim();summary=(Read-Entry $zip '___ProjectDescription');image=$image;steps=$steps;source=$file.FullName}
        $unit.activities+= $activityId
        if(-not $unit.image){$unit.image=$image}
        if($group -eq 'home'){$unit.title=($title -replace '\s+\d+.*$','').Trim()}
      }finally{if($nested){$nested.Dispose()};if($nestedMemory){$nestedMemory.Dispose()};$zip.Dispose()}
    }
    if($unit.activities.Count -and ($group -eq 'home' -or $group -eq 'workshops')){$catalog.units+=$unit}
  }
}
$json = $catalog | ConvertTo-Json -Depth 100
[IO.File]::WriteAllText($catalogPath,$json,[Text.UTF8Encoding]::new($false))
Write-Output "Units: $($catalog.units.Count); activities: $($catalog.activities.Count); manuals: $($catalog.manuals.Count)"
