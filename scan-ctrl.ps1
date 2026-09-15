$out = 'C:\Users\AQ\Desktop\Pho-chu-map\_dump.txt'
Remove-Item $out -ErrorAction SilentlyContinue
$targets = @(
  'src\App.jsx',
  'src\pages\HomePage.jsx',
  'src\pages\CartPage.jsx',
  'src\pages\MenuPage.jsx',
  'src\pages\NotFoundPage.jsx',
  'src\pages\ReservePage.jsx',
  'src\pages\AdminLogin.jsx',
  'src\pages\OrderConfirmationPage.jsx',
  'src\pages\CheckoutPage.jsx'
)
foreach ($t in $targets) {
  $p = Join-Path 'C:\Users\AQ\Desktop\Pho-chu-map' $t
  Add-Content -Path $out -Value ""
  Add-Content -Path $out -Value "===== FILE: $t ====="
  $i = 1
  foreach ($line in [IO.File]::ReadAllLines($p)) {
    Add-Content -Path $out -Value ("{0,4}: {1}" -f $i, $line)
    $i++
  }
}
Write-Output "dump complete"


