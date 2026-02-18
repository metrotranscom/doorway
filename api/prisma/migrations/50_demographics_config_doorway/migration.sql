-- Set default race/ethnicity configuration for existing jurisdictions
UPDATE "jurisdictions"
SET "race_ethnicity_configuration" = '{
  "options": [
    {
      "id": "asian",
      "subOptions": [
        {"id": "chinese", "allowOtherText": false},
        {"id": "filipino", "allowOtherText": false},
        {"id": "japanese", "allowOtherText": false},
        {"id": "korean", "allowOtherText": false},
        {"id": "mongolian", "allowOtherText": false},
        {"id": "vietnamese", "allowOtherText": false},
        {"id": "centralAsian", "allowOtherText": false},
        {"id": "southAsian", "allowOtherText": false},
        {"id": "southeastAsian", "allowOtherText": false},
        {"id": "otherAsian", "allowOtherText": true}
      ],
      "allowOtherText": false
    },
    {
      "id": "black",
      "subOptions": [
        {"id": "african", "allowOtherText": false},
        {"id": "africanAmerican", "allowOtherText": false},
        {"id": "caribbeanCentralSouthAmericanMexican", "allowOtherText": false},
        {"id": "otherBlack", "allowOtherText": true}
      ],
      "allowOtherText": false
    },
    {
      "id": "indigenous",
      "subOptions": [
        {"id": "alaskanNative", "allowOtherText": false},
        {"id": "nativeAmerican", "allowOtherText": false},
        {"id": "indigenousFromMexicoCaribbeanCentralSouthAmerica", "allowOtherText": false},
        {"id": "otherIndigenous", "allowOtherText": true}
      ],
      "allowOtherText": false
    },    
    {
      "id": "latino",
      "subOptions": [
        {"id": "caribbean", "allowOtherText": false},
        {"id": "centralAmerican", "allowOtherText": false},
        {"id": "mexican", "allowOtherText": false},
        {"id": "southAmerican", "allowOtherText": false},
        {"id": "otherLatino", "allowOtherText": true}
      ],
      "allowOtherText": false
    },
    {
      "id": "middleEasternOrAfrican",
      "subOptions": [
        {"id": "northAfrican", "allowOtherText": false},
        {"id": "westAsian", "allowOtherText": false},
        {"id": "otherMiddleEasternNorthAfrican", "allowOtherText": true}
      ],
      "allowOtherText": false
    },
    {
      "id": "pacificIslander",
      "subOptions": [
        {"id": "chamorro", "allowOtherText": false},
        {"id": "nativeHawaiian", "allowOtherText": false},
        {"id": "samoan", "allowOtherText": false},
        {"id": "otherPacificIslander", "allowOtherText": true}
      ],
      "allowOtherText": false
    },
    {
      "id": "white",
      "subOptions": [
        {"id": "european", "allowOtherText": false},
        {"id": "otherWhite", "allowOtherText": true}
      ],
      "allowOtherText": false
    }
  ]
}';