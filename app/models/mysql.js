var mysql = require('mysql');
var Validator = require("jsonschema").Validator;
var configDB = require('../../config/database.js');

var connection = mysql.createConnection({
    host: configDB.urlMySql.url,
    user: configDB.urlMySql.user,
    password: configDB.urlMySql.password,
    database: configDB.urlMySql.database
});

module.exports = {
    getPropertiesJson: function(user, callback) {
        var sendJson = ''; // return Json
        var cpsRef = ''; // holder for previous cps_ref to detect new propety
        var totalImages = 0; // Image counter to know when to reset the counter for new properties
        //connection.connect();
        console.log(user._id);
        
        // INSERT IGNORE if no user exists in MySQL
        connection.query('INSERT IGNORE INTO mongoclients SET id_mongo = "' + user._id + '"', function (err, result){
            if (err) throw err;
            console.log('insert mongoclient ' + result.affectedRows + ' rows');
        });
        
        // now grabe 10 new id's
        connection.query(`  INSERT INTO mongoclientproperties (id_property, id_mongo)
                            SELECT id_property, '` + user._id + `'
                            FROM property
                            WHERE status = 'Available' AND id_property NOT IN (
                            select id_property FROM mongoclientproperties WHERE id_mongo = '` + user._id + `')
                            ORDER BY id_property
                            LIMIT 10`, function (err, result){
                                if (err) throw err;
                                console.log('insert mongoclientproperties ' + result.affectedRows + ' rows');
                            });
        // SELECT the new 10 properties for displaying
        connection.query(`
            SELECT  p.cps_reference, p.price, p.beds, p.baths, p.has_pool, p.has_garden, p.has_garage, 
                    p.listed_date, pt.property_type, t.town, pr.province, c.country, i.url, p.description
            FROM property p
            INNER JOIN property_type pt ON pt.id_property_type = p.id_type
            INNER JOIN town t ON t.id_town = p.id_town
            INNER JOIN province pr ON pr.id_province = t.id_province
            INNER JOIN country c ON c.id_country = pr.id_country
            INNER JOIN image i ON p.id_property = i.id_property
            INNER JOIN mongoclientproperties m ON p.id_property = m.id_property AND m.id_mongo = '` + user._id + `' AND m.supplied = 0
            WHERE p.status = "Available"
            ORDER BY p.id_property`,
            function(err, rows, fields) {
                
                if (err) return callback(err);
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];

                    if (cpsRef == row.cps_reference && totalImages == 0) {
                        totalImages++;
                    }
                    else if (cpsRef != row.cps_reference) {
                        // close previous property and finish images
                        if (sendJson.length != 0) {
                            sendJson = stringStripLastCharacter(sendJson);
                            sendJson += "]},";
                        }
                        sendJson += '{ ';
                        for (var x = 0; x < fields.length; x++) {
                           // console.log(row);
                           var fldName = fields[x].name;
                            if (fldName != 'url') sendJson += '"'+fldName+'": "' + row[fldName] + '",';
                        }
                        //read_prop(row, fields[x].name)
                        // Images
                        sendJson += '"images" : [';
                    }
                    sendJson += '{"url": "' + row.url + '"},';

                    // may need to close images

                    cpsRef = rows[i].cps_reference;


                }

                // Clean up removing trailing comma and ending the Json
                sendJson = stringStripLastCharacter(sendJson);
                sendJson += "]}";
                
                connection.query(`  UPDATE mongoclientproperties SET supplied = 1
                                    WHERE id_mongo = '` + user._id + `'`, function(err, rows, fields){
                   if (err) throw err; 
                });

                //connection.end();

                sendJson = '{"properties": [' + sendJson + ']}';

                callback(sendJson);
            });
        
    },
    setPropertiesJson: function(user, jsonUpload, jsonSchema, callback){
        var v = new Validator();
 
        var returnValidate = v.validate(jsonUpload, jsonSchema);
        
        if (returnValidate.errors.length > 0){
            callback(returnValidate.errors, null);
        } else {
            

        // For every Property in JSON
        for( var property in jsonUpload) {    
            // For every field in Property
            for( var fields in jsonUpload[property] ) {
                // Get the field
                var field = jsonUpload[property][fields];
                
                // Get Property Type
                var propertyType = getPropertyType(field.property_type);
                
                // Get Country
                var country = getCountry(field.country);
                // Get Province
                var province = getProvince(field.province);
                // Get Town
                var town = getTown(field.town);
                // Insert Property
                
                // Insert Images
                //console.log( 'State: ' + field.cps_reference);       
                console.log(`INSERT INTO property SET
                cps_reference = '` + field.cps_reference + `', 
                p.price = '` + field.price + `',
                p.beds = '` + field.beds + `', 
                p.baths = '` + field.baths + `', 
                p.has_pool = '` + field.has_pool + `', 
                p.has_garden = '` + field.has_garden + `', 
                p.has_garage = '` + field.has_garage + `', 
                p.listed_date = '` + field.listed_date + `', 
                pt.property_type = '` + propertyType + `', 
                t.town = '` + town + `', 
                pr.province = '` + province + `', 
                c.country = '` + country + `', 
                p.description = '` + field.description + `'`);
                
                //, function (err, result){
                //    if (err) return callback(err);
                   callback(null, "Success");
            //});
            }
        }
        
        callback("ended");
       
        }
    
    }
};
function stringStripLastCharacter(inStr) {
    return inStr.slice(0, inStr.length - 1);
}

function getPropertyType(propertyType) {
    
    return propertyType;
}

function getCountry(country){

    return country;    
}

function getProvince(province){

    return province;    
}

function getTown(town){

    return town;    
}