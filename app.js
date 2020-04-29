const express = require("express")
const app = express()
const axios = require("axios")
const expressLayout = require("express-ejs-layouts")
const moment = require("moment-timezone")

app.use(expressLayout)
app.set("view engine", "ejs")
app.use(express.urlencoded({
    extended: false
}))

app.use(express.static("public"));


app.get("/", async (req, res) => {
    const dat = await axios.get("https://covid19.mathdro.id/api/countries")
    const countryLength = dat.data.countries.length
    countryName = []
    for (i = 0; i < countryLength; i++) {
        countryName[i] = dat.data.countries[i].name
    }
    const total = await axios.get("https://covid19.mathdro.id/api")
    confirmed = total.data.confirmed.value
    recovered = total.data.recovered.value
    deaths = total.data.deaths.value
    active = confirmed - (recovered + deaths)

    countryConfirmed = []
    countryActive = []
    countryRecovered = []
    countryDeaths = []

    for (i = 0; i < countryLength; i++) {
        try {
            let countryconfirm = await axios.get(`https://covid19.mathdro.id/api/countries/${countryName[i]}/confirmed`)
            if (!countryconfirm) {
                countryConfirmed[i] = "not found"
                countryRecovered[i] = "not found"
                countryDeaths[i] = "not found"
            }
            countryConfirmed[i] = countryconfirm.data[0].confirmed
            countryRecovered[i] = countryconfirm.data[0].recovered
            countryDeaths[i] = countryconfirm.data[0].deaths
        } catch (e) {
            countryConfirmed[i] = "not found"
            countryRecovered[i] = "not found"
            countryDeaths[i] = "not found"
        }
        countryActive[i] = (countryConfirmed[i] - (countryRecovered[i] + countryDeaths[i]))

    }

    res.render("world", {
        countryLength,
        countryName,
        countryConfirmed,
        countryActive,
        countryRecovered,
        countryDeaths,
        confirmed,
        recovered,
        active,
        deaths
    })
})


app.get("/india", async (req, res) => {

    const dat1 = await axios.get("https://api.covid19india.org/data.json")

    const states = []
    const stateLength = dat1.data.statewise.length
    stateConfirmedPatient = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    stateActivePatient = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    stateDeceasedPatient = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    stateRecoveredPatient = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    for (i = 0; i < stateLength; i++) {
        stateConfirmedPatient[i] = dat1.data.statewise[i].confirmed
        stateActivePatient[i] = dat1.data.statewise[i].active
        stateDeceasedPatient[i] = dat1.data.statewise[i].deaths
        stateRecoveredPatient[i] = dat1.data.statewise[i].recovered
        states[i] = dat1.data.statewise[i].state
    }
    
    todayConfirmed = dat1.data.statewise[0].deltaconfirmed
    todayRecovered = dat1.data.statewise[0].deltarecovered
    todayDeceased = dat1.data.statewise[0].deltadeaths
    preupdatedTime = dat1.data.statewise[0].lastupdatedtime
    presentTime = moment().tz("Asia/Kolkata").format("MM/DD/YYYY HH:mm:ss")
    
    dd = preupdatedTime.substring(0, 2)
    mm = preupdatedTime.substring(3, 5)
    updatedTime = mm + "/" + dd + "/" + preupdatedTime.substring(6, preupdatedTime.length)
    d1 = new Date(presentTime)
    ldate = d1.getTime()
    d2 = new Date(updatedTime)
    pdate = d2.getTime()
    millisec = d1 - d2

    seconds = (millisec / 1000).toFixed(0)
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        intervalType = 'day';
    } else {
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            intervalType = "hour";
        } else {
            interval = Math.floor(seconds / 60);
            if (interval >= 1) {
                intervalType = "minute";
            } else {
                interval = seconds;
                intervalType = "second";
            }
        }
    }

    if (interval > 1 || interval === 0) {
        intervalType += 's';
    }

    lastUpdate = interval + ' ' + intervalType + " ago"

    res.render("india", {
        states,
        stateConfirmedPatient,
        stateActivePatient,
        stateDeceasedPatient,
        todayConfirmed,
        todayRecovered,
        todayDeceased,
        stateRecoveredPatient,
        lastUpdate
    })
})


const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Connected to port ${port}`))