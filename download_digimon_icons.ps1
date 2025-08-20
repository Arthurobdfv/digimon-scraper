# PowerShell script to download all Digimon icons from digimon_icon_map.csv
$csv = Import-Csv -Path "digimon_icon_map.csv"
foreach ($row in $csv) {
    $name = $row.Name -replace '[^a-zA-Z0-9\-_. ]', ''
    $iconUrl = $row.Icon
    $filename = "Icons/Digimon/$name-icon.png"
    Invoke-WebRequest $iconUrl -OutFile $filename
}
