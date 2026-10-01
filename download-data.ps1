$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$root = $PSScriptRoot
[IO.Directory]::CreateDirectory((Join-Path $root 'assets')) | Out-Null
[IO.Directory]::CreateDirectory((Join-Path $root 'data')) | Out-Null
$encoding = New-Object System.Text.UTF8Encoding($false)
function Save-JsonJs($name, $value) {
  $json = ConvertTo-Json -InputObject $value -Depth 30 -Compress
  [IO.File]::WriteAllText((Join-Path $root "data/$name.js"), "window.ATLAS_$($name.ToUpper()) = $json;", $encoding)
}
function Get-Features($base, $fields) {
  $all = [System.Collections.Generic.List[object]]::new()
  $offset = 0
  do {
    $url = "$base/query?where=1%3D1&outFields=$fields&outSR=4326&resultOffset=$offset&resultRecordCount=2000&orderByFields=OBJECTID&f=json"
    $response = Invoke-RestMethod $url
    if ($response.error) { throw ($response.error | ConvertTo-Json) }
    foreach ($feature in $response.features) { $all.Add($feature) }
    $offset += $response.features.Count
  } while ($response.exceededTransferLimit -and $response.features.Count -gt 0)
  return ,$all.ToArray()
}
$air = Get-Features 'https://services1.arcgis.com/4ezfu5dIwH83BUNL/ArcGIS/rest/services/Airplane_Crashes_and_Fatalities/FeatureServer/0' 'ObjectID,USER_Date,USER_Location,USER_Operator,USER_Flight__,USER_Route,USER_AC_Type,USER_Aboard,USER_Fatalities,USER_Ground,USER_Summary,Country,Score'
$airClean = @($air | ForEach-Object {
  $a = $_.attributes
  @{ id = "a$($a.ObjectID)"; date = $a.USER_Date; location = $a.USER_Location; operator = $a.USER_Operator; flight = $a.USER_Flight__; route = $a.USER_Route; aircraft = $a.USER_AC_Type; aboard = $a.USER_Aboard; fatalities = $a.USER_Fatalities; ground = $a.USER_Ground; summary = $a.USER_Summary; country = $a.Country; score = $a.Score; lon = $_.geometry.x; lat = $_.geometry.y }
})
Save-JsonJs 'aviation' $airClean
Write-Output "Aviation records: $($airClean.Count)"
$wrecks = Get-Features 'https://services5.arcgis.com/HDRa0B57OVrv2E1q/ArcGIS/rest/services/Wrecks_and_Obstructions/FeatureServer/0' '*'
$wreckClean = @($wrecks | Where-Object { $_.attributes.vesselTerm -notmatch 'OBSTRUCTION|ROCK|FISH|PILE|DUMP' } | ForEach-Object {
  $a = $_.attributes
  $depth = $null
  if ($a.depth -gt 0) {
    if ($a.soundingTy -match 'Feet') { $depth = [Math]::Round($a.depth * 0.3048, 1) }
    elseif ($a.soundingTy -match 'Fathom') { $depth = [Math]::Round($a.depth * 1.8288, 1) }
    elseif ($a.soundingTy -match 'Meter') { $depth = $a.depth }
  }
  @{ id = "w$($a.record)"; name = $a.vesselTerm; year = $a.yearSunk; depth = $depth; rawDepth = $a.depth; units = $a.soundingTy; summary = $a.history; lat = $a.latitudeDD; lon = $a.longitudeD; quality = $a.positionQu }
})
Save-JsonJs 'wrecks' $wreckClean
Write-Output "Wreck records: $($wreckClean.Count)"
$eq = Invoke-RestMethod 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=1900-01-01&endtime=2026-01-01&minmagnitude=7&orderby=time-asc'
$eqClean = @($eq.features | ForEach-Object {
  @{ id = $_.id; name = $_.properties.place; date = $_.properties.time; magnitude = $_.properties.mag; url = $_.properties.url; lon = $_.geometry.coordinates[0]; lat = $_.geometry.coordinates[1]; depth = $_.geometry.coordinates[2]; tsunami = $_.properties.tsunami }
})
Save-JsonJs 'earthquakes' $eqClean
Write-Output "Earthquake records: $($eqClean.Count)"
Invoke-WebRequest 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson' -OutFile (Join-Path $root 'data/world.json') -UseBasicParsing
$world = Get-Content (Join-Path $root 'data/world.json') -Raw | ConvertFrom-Json
Save-JsonJs 'world' $world
Remove-Item -LiteralPath (Join-Path $root 'data/world.json')
Invoke-WebRequest 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js' -OutFile (Join-Path $root 'assets/d3.min.js') -UseBasicParsing
Invoke-WebRequest 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=85' -OutFile (Join-Path $root 'assets/flight.jpg') -UseBasicParsing
Write-Output 'Map assets downloaded.'