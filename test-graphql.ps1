$body = '{"query":"{ __type(name: \"Query\") { fields { name } } }"}'
$response = Invoke-RestMethod -Uri 'http://localhost:4001/graphql' -Method Post -Body $body -ContentType 'application/json' -UseBasicParsing
Write-Output ($response | ConvertTo-Json -Depth 5)
