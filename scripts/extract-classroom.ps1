$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot 'extract-classroom-bundle.mjs')
if($LASTEXITCODE -ne 0){throw 'Bundle extraction failed'}
$root=Join-Path $PSScriptRoot '../.preservation/classroom'
$dll=Get-ChildItem -LiteralPath $root -Filter '*Classroom.dll' | Select-Object -First 1
$assembly=[Reflection.Assembly]::ReflectionOnlyLoadFrom($dll.FullName)
$resources=Join-Path $root 'resources'
[IO.Directory]::CreateDirectory($resources) | Out-Null
foreach($name in $assembly.GetManifestResourceNames()){
  $source=$assembly.GetManifestResourceStream($name)
  $target=[IO.File]::Create((Join-Path $resources $name))
  try{$source.CopyTo($target)}finally{$source.Dispose();$target.Dispose()}
}
$map=Get-Content -LiteralPath (Join-Path $resources 'Com.Lego.Flipper.Windows.assets.map.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$extracted=[IO.Path]::GetFullPath((Join-Path $root 'extracted'))
foreach($item in $map){
  if($item.isdir){continue}
  $relative=($item.dir.TrimEnd('/')+'/'+$item.name).TrimStart('/')
  $target=[IO.Path]::GetFullPath((Join-Path $extracted $relative))
  if(-not $target.StartsWith($extracted+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw 'Unsafe resource path'}
  [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($target)) | Out-Null
  Copy-Item -LiteralPath (Join-Path $resources ('Com.Lego.Flipper.Windows.assets.'+$item.resource)) -Destination $target -Force
}
Write-Output 'Local resources extracted without executing the Classroom assembly.'
