module.exports =  {
    jsonSchema : {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "properties": {
        "properties": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "cps_reference": {
                "type": "string"
              },
              "price": {
                "type": "string"
              },
              "beds": {
                "type": "string"
              },
              "baths": {
                "type": "string"
              },
              "has_pool": {
                "type": "string"
              },
              "has_garden": {
                "type": "string"
              },
              "has_garage": {
                "type": "string"
              },
              "listed_date": {
                "type": "string"
              },
              "property_type": {
                "type": "string"
              },
              "town": {
                "type": "string"
              },
              "province": {
                "type": "string"
              },
              "country": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "images": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "url": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "url"
                  ]
                }
              }
            },
            "required": [
              "cps_reference",
              "price",
              "beds",
              "baths",
              "has_pool",
              "has_garden",
              "has_garage",
              "listed_date",
              "property_type",
              "town",
              "province",
              "country",
              "description",
              "images"
            ]
          }
        }
      },
      "required": [
        "properties"
      ]
    }
};