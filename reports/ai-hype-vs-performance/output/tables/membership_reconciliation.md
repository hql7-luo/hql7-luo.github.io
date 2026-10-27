# Membership reconciliation

Fresh tidyquant/SSGA snapshot: 2026-10-27 03:44:50 UTC
The study's archived Wikipedia table has 503 stock listings. All 503 tickers occur in the fresh SSGA SPY holdings after normalizing BRK-B/BRK.B and similar share-class punctuation.
The fresh tq_index list has 505 rows because it also includes '-' (US DOLLAR) and 2602335D (CONTRA HOLOGIC INCORPO, identifier 436CVR021). These are fund cash/contra positions, not additional current S&P 500 company constituents.
S&P Dow Jones Indices announced HOLX's deletion effective April 9, 2026 and CASY's addition. Thus the Hologic contra position does not indicate a missing current company in the archived table.
No change to the study membership was required. The original startup warning is retained as part of the issue history; this later, saved comparison resolves its scope.

SSGA source: https://www.ssga.com/us/en/institutional/library-content/products/fund-data/etfs/us/holdings-daily-us-en-spy.xlsx
S&P source: https://press.spglobal.com/2026-04-06-Caseys-General-Stores-Set-to-Join-S-P-500-DigitalOcean-Holdings-to-Join-S-P-MidCap-400-Broadstone-Net-Lease-to-Join-S-P-SmallCap-600

This comparison verifies the fresh ETF snapshot against the archived company list. It does not reconstruct the originally discarded tidyquant response or historical S&P membership.
