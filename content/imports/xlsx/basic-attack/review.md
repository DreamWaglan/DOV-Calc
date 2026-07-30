# XLSX Basic Attack Import Review

- sourceAssetId: src-0c5b7db892f6
- permission: authorized
- publishable: false
- applicableVersion: 2026-07
- verifiedAt: 2026-07-29
- sourceSha256: 0f1e9968adbcd3dcdc669168af97f0f40d5de55f928d645e99a9e30d95bf0379

## Worksheet Counts

| Worksheet | Rows | Data Rows | Fields |
| --- | ---: | ---: | ---: |
| 驱逐 | 51 | 50 | 8 |
| 轻巡雷巡 | 42 | 38 | 8 |
| 重巡 | 27 | 26 | 8 |
| 战列战巡重炮 | 49 | 43 | 10 |
| 轻母 | 20 | 18 | 7 |
| 航母装母 | 51 | 44 | 8 |
| 航战水母 | 11 | 6 | 5 |

## Checklist

- [x] Workbook has exactly 7 worksheets in the expected order.
- [x] Headers and aviation preface rows match the maintained mapping.
- [x] Names, inherited names, unique IDs, numeric ranges, empty cells, and unknown cells were validated.
- [x] Source authorization is recorded separately from migration review state.
- [x] Outputs remain non-publishable until dataset fact review is complete.
