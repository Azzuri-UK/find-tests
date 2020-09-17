const fetch = require('node-fetch')
const axios = require('axios')
require('dotenv').config()

async function getSlots(type) {
    let params;
    if (type === 'wt'){
        params = {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                "content-type": "application/json",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
            },
            "referrer": "https://test-for-coronavirus.service.gov.uk/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "{\"topLevelTestCentreId\":\"CVD19\",\"postcode\":\"" + process.env.TEST_POSTCODE + "\",\"testCentreGroupIds\":[\"GR_RTS\",\"GR_MTU\"],\"startDate\":\"2020-09-15T00:00:00\",\"numberOfDays\":5,\"appointmentTypeCode\":\"ATCOM05\",\"paging\":{\"currentPage\":1,\"pageSize\":3}}",
            "method": "POST",
            "mode": "cors"
        };
    } else {
        params = {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                "content-type": "application/json",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
            },
            "referrer": "https://test-for-coronavirus.service.gov.uk/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "{\"topLevelTestCentreId\":\"CVD19\",\"postcode\":\"" + process.env.TEST_POSTCODE + "\",\"testCentreGroupIds\":[\"GR_RTS\",\"GR_STS\",\"GR_MTU\"],\"startDate\":\"2020-09-15T00:00:00\",\"numberOfDays\":5,\"appointmentTypeCode\":\"ATCOM06\",\"paging\":{\"currentPage\":1,\"pageSize\":3}}",
            "method": "POST",
            "mode": "cors"
        };
    }

    params.headers['x-urlcode'] = process.env.TEST_URLCODE;

    let response = await fetch("https://ads-prd-gov-1-sp.test-for-coronavirus.service.gov.uk/testcentres/availabilityquery", params);
    if (response.ok) {
        let centers = [];
        let json = await response.json();
        for (let center in json.testCentres) {
            let distance = json.testCentres[center].geolocation.distance;
            if (distance < process.env.TEST_DISTANCE) {
                centers.push(json.testCentres[center])
            }
        }
        return centers
    } else {
        console.log("HTTP-Error: " + response.status);
        return false;
    }
}

const interval = setInterval(function() {
    getSlots('dt').then(centers => {
        if (centers !== false) {
            if (centers.length > 0) {
                let centerInfo =''
                for (let center in centers) {
                    centerInfo += '<pre>>Centre Name:  ' + centers[center].testCentre.displayName
                    centerInfo += '<br>Location:  ' + centers[center].testCentre.address.town + '<br>'
                    centerInfo += '# Slots:  ' + centers[center].availability.availableSlots + '</pre>'
                }
                axios.get('https://maker.ifttt.com/trigger/CenterFound/with/key/' + process.env.IFFT_SECRET + '?value1=drive%20through%20' +centers.length + '&value2=' + process.env.TEST_DISTANCE) + '&value3=' +centerInfo;
                console.log(centers.length + ' drive through centers within '+ process.env.TEST_DISTANCE + ' miles')
            } else {
                console.log('No drive through centers within ' + process.env.TEST_DISTANCE + ' miles');
            }
        }
    });
    getSlots('wt').then(centers => {
        if (centers !== false) {
            if (centers.length > 0) {
                let centerInfo =''
                for (let center in centers) {
                    centerInfo += '<pre>>Centre Name:  ' + centers[center].testCentre.displayName
                    centerInfo += '<br>Location:  ' + centers[center].testCentre.address.town + '<br>'
                    centerInfo += '# Slots:  ' + centers[center].availability.availableSlots + '</pre>'
                }
                axios.get('https://maker.ifttt.com/trigger/CenterFound/with/key/' + process.env.IFFT_SECRET + '?value1=walk%20in%20' +centers.length + '&value2=' + process.env.TEST_DISTANCE) + '&value3=' +centerInfo;
                console.log(centers.length + ' walk in centers within '+ process.env.TEST_DISTANCE + ' miles')
            } else {
                console.log('No walk in centers within ' + process.env.TEST_DISTANCE + ' miles');
            }
        }
    });
}, 10000);