import React from "react"
import { useContext, useEffect, useState } from "react"
import styles from "../styles/chart.module.scss"
import { useRouter } from "next/router"
import Router from "next/router"
import { AppContext } from "../context/state"
import { useCookies } from "react-cookie"
import {PacmanLoader} from "react-spinners"
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ReferenceLine,
} from "recharts"
import { Button, ButtonGroup, Chip, Divider } from "@mui/material"
import { createTheme, ThemeProvider } from '@mui/material/styles';

var maxmmr = 0
var localmaxmmr = 0
var ticks = []
var showCount = 300
var width = 1920
var height = 1080
export default function Chart(props) {
  const { setCourse, backip } = useContext(AppContext)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(0)
  const [hide, setHide] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [results, setResults] = useState()
  const [profile, setProfile] = useState()
  const [rankedWinrate, setRankedWinrate] = useState()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchList, setSearchList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [player, setPlayer] = useState("mpowend")
  const [cookies, setCookie] = useCookies(["userid", "token"])
  const [p, setp] = useState()
  const theme = createTheme({
    palette: {
      primary: { main: '#9046f0' },
      secondary: { main: '#fcc216' },
    },
  });


  console.log(loading)

  var data = []
  const players = [
    "mpowend",
    "teramir",
    "darjaryan",
    "lim",
    "forlorn",
    "netflix",
  ]
  const colors = [
    "#f1c40f",
    "#1abc9c",
    "#e74c3c",
    "#3498db",
    "#e67e22",
    "#167e22",
  ]

  var load = () => {
    if (loading) {
      var playerID = getPlayerID(player)
      fetch(
        "https://api.opendota.com/api/players/" +
          playerID +
          "/matches/?lobby_type=7",
        {
          method: "get",
        }
      )
        .then(async (res) => {
          if (res.status === 401) {
            setWrong(true)
          } else {
            return await res.json()
          }
        })
        .then(async (r) => {
          var temp = []
          console.log("r")
          console.log(r)
          if (r == undefined) {
            r = []
          }
          r = r.reverse()
          for (let i = 0; i < r.length; i++) {
            temp.push(r[i])
          }
          console.log("temp")
          console.log(temp)
          setResults(temp)
          setLoading(false)
        })
    }
    if (!loading) {
      var d = results
      var tempdata = []

      //mpowend 1240
      //teramir 1340
      //puyan 980
      // netflix 2340
      // lim 820
      //forlorn 2960
      var mmr = getBaseMMR(player)
      // switch (player) {
      //   case "mpowend":
      //     mmr = 1240
      //     break
      //   case "teramir":
      //     mmr = 1340
      //     break
      //   case "darjaryan":
      //     mmr = 980
      //     break
      //   case "lim":
      //     mmr = 150
      //     break
      //   default:
      //     break
      // }
      var wins = 0,
        total = 0,
        req = []
      for (let i = 0; i < d.length; i++) {
        const game = d[i]
        var date = new Date(game.start_time * 1000)
        const lose =
          (game.radiant_win && game.player_slot > 127) ||
          (!game.radiant_win && game.player_slot < 128)
        const leave = game.leaver_status == 1
        if (game.party_size == null) {
          req.push(game.match_id)
        }
        var mmrChange = 25

        if (lose || leave) {
          mmrChange = -mmrChange
        }
        mmr += mmrChange
        maxmmr = maxmmr > mmr ? maxmmr : mmr
        if (date.getHours() >= 18 && date.getHours() <= 24) {
          wins += Math.sign(mmrChange) > 0 ? 1 : 0
          total += 1
        }

        if (i > d.length - showCount) {
          localmaxmmr = localmaxmmr > mmr ? localmaxmmr : mmr
          data.push({
            date:
              date.getFullYear() +
              "/" +
              (date.getMonth() + 1) +
              "/" +
              date.getDate() +
              " " +
              date.getHours() +
              ":" +
              date.getMinutes(),
            party: game.party_size == 1 ? 0 : game.party_size * 10,
            win: !(lose || leave),
            mmr: mmr,
          })
        }
      }

      async function sendreqs(gameIdList) {
        for (let i = 0; i < gameIdList.length; i++) {
          fetch("https://api.opendota.com/api/request/" + gameIdList[i], {
            mode: "no-cors",
            method: "post",
          })
          console.log("fetched request")
          await new Promise((resolve) => setTimeout(resolve, 5000))
        }
      }

      console.log("nulls:" + req.length)
      sendreqs(req)

      var temp = [
        0, 154, 308, 462, 616, 770, 924, 1078, 1232, 1386, 1540, 1694, 1848,
        2002, 2156, 2310, 2464, 2618, 2772, 2926, 3080, 3234, 3388, 3542, 3696,
        3850, 4004, 4158, 4312, 4466, 4620, 4820, 5020, 5220, 5420, 9999,
      ]
      for (let i = 0; i < d.length; i++) {
        if (localmaxmmr >= temp[i]) ticks.push(temp[i + 1])
      }

      console.log(d)
      console.log("LMM:" + localmaxmmr)
      console.log(ticks)
      setRankedWinrate(((wins * 100) / total).toFixed(2))
      setProfile(data)
      setHide(false)
    }
  }

  const getPlayerID = (p) => {
    switch (p) {
      case "mpowend":
        return 358792797
      case "teramir":
        return 210899035
      case "darjaryan":
        return 491280560
      case "netflix":
        return 846545366
      case "lim":
        return 387307098
      case "forlorn":
        return 212778035
      default:
        return 358792797
    }
  }

  const getBaseMMR = (p) => {
    switch (p) {
      case "mpowend":
        return 1550
      case "teramir":
        return 930
      case "darjaryan":
        return 1130
      case "lim":
        return 150
      case "forlorn":
        return 2320
      case "netflix":
        return 1970
      default:
        return 0
    }
  }

  //all players in the same graph

  const gameloadall = async () => {
    var loadC = 0
    if (loading) {
      // offset=900&&
      var tempres = []
      // for (let i = 0; i < players.length; i++) {
      await Promise.all(
        players.map(async (element, index) => {
          await fetch(
            "https://api.opendota.com/api/players/" +
              getPlayerID(element) +
              "/matches/?lobby_type=7",
            {
              method: "get",
            }
          )
            .then(async (res) => {
              if (res.status === 401) {
                setWrong(true)
              } else {
                return await res.json()
              }
            })
            .then(async (r) => {
              var temp = []
              console.log("r")
              console.log(r)
              if (r == undefined) {
                r = []
              }
              r = r.reverse()
              for (let i = 0; i < r.length; i++) {
                const element = r[i]
                if (element.lobby_type == 7) {
                  temp.push(element)
                }
              }
              console.log("temp")
              console.log(temp)
              tempres.push({ name: element, games: temp })
              loadC++
            })
        })
      )
      // const playerID = getPlayerID(players[i])
      // fetch(
      //   "https://api.opendota.com/api/players/" +
      //     playerID +
      //     "/matches/?lobby_type=7",
      //   {
      //     method: "get",
      //   }
      // )
      //   .then(async (res) => {
      //     if (res.status === 401) {
      //       setWrong(true)
      //     } else {
      //       return await res.json()
      //     }
      //   })
      //   .then(async (r) => {
      //     var temp = []
      //     console.log("r")
      //     console.log(r)
      //     r = r.reverse()
      //     for (let i = 0; i < r.length; i++) {
      //       const element = r[i]
      //       if (element.lobby_type == 7) {
      //         temp.push(element)
      //       }
      //     }
      //     console.log("temp")
      //     console.log(temp)
      //     tempres.push({ name: players[i], games: temp })
      //     loadC++
      //   })
      // }

      console.log("tempres")
      console.log(tempres)
      setResults(tempres)
      setLoading(false)
    }
    if (!loading) {
      var tempAllData = []
      var wins = 0
      var total = 0

      //data management for analysis
      var windata = new Array(24).fill(0)
      var totaldata = new Array(24).fill(0)

      for (let i = 0; i < results.length; i++) {
        var d = results[i].games
        var tempdata = {}
        var mmr = getBaseMMR(results[i].name)
        var rankedMatches = 0

        //data management for analysis
        for (let i = 0; i < d.length; i++) {
          const game = d[i]
          var date = new Date(game.start_time * 1000)
          const lose =
            (game.radiant_win && game.player_slot > 127) ||
            (!game.radiant_win && game.player_slot < 128)
          const leave = game.leaver_status == 1

          totaldata[date.getHours()] += 1
          if (lose || leave) {
            // windata[date.getHours()] -= 1
          } else {
            windata[date.getHours()] += 1
          }
        }

        var data = []
        for (let i = 0; i < d.length; i++) {
          const game = d[i]
          var date = new Date(game.start_time * 1000)
          const lose =
            (game.radiant_win && game.player_slot > 127) ||
            (!game.radiant_win && game.player_slot < 128)
          const leave = game.leaver_status == 1
          // if (game.party_size == null) {
          //   fetch("https://api.opendota.com/api/request/" + game.match_id)
          //   console.log("null! " + game.match_id)
          // }
          var mmrChange = game.party_size == 1 ? 30 : 20
          rankedMatches += 1

          if (lose || leave) {
            mmrChange = -mmrChange
          }
          mmr += mmrChange
          maxmmr = maxmmr > mmr ? maxmmr : mmr

          var hour = 21,
            hourdif = 1
          if (date.getHours() >= hour && date.getHours() <= hour + hourdif) {
            wins += Math.sign(mmrChange) > 0 ? 1 : 0
            total += 1
          }

          if (i > d.length - showCount) {
            localmaxmmr = localmaxmmr > mmr ? localmaxmmr : mmr
            data.push({
              date:
                date.getDate() +
                "/" +
                (date.getMonth() + 1) +
                "/" +
                date.getFullYear(),
              party: game.party_size == 1 ? 0 : game.party_size * 10,
              win: !(lose || leave),
              mmr: mmr,
            })
          }
        }
        //after one player
        tempAllData.push({ name: results[i].name, data: data })
      }

      //after all results

      //data management for analysis
      var res = 0
      for (let i = 0; i < windata.length; i++) {
        res += (windata[i] * 100) / totaldata[i]
      }
      res = (res / windata.length).toFixed(2)
      setRankedWinrate(res)

      //34666
      console.log("tempAllData")
      console.log(tempAllData)
      var temp = [
        0, 154, 308, 462, 616, 770, 924, 1078, 1232, 1386, 1540, 1694, 1848,
        2002, 2156, 2310, 2464, 2618, 2772, 2926, 3080, 3234, 3388, 3542, 3696,
        3850, 4004, 4158, 4312, 4466, 4620, 4820, 5020, 5220, 5420, 9999,
      ]
      for (let i = 0; i < d.length; i++) {
        if (localmaxmmr >= temp[i]) ticks.push(temp[i + 1])
      }
      var finalAll = []
      for (let index = 0; index < showCount - 1; index++) {
        let t = {}
        for (let j = 0; j < tempAllData.length; j++) {
          if (tempAllData[j].data[index])
            t[tempAllData[j].name] = tempAllData[j].data[index].mmr
        }
        finalAll.push(t)
      }
      console.log(finalAll)
      console.log("LMM:" + localmaxmmr)
      console.log(ticks)
      // setRankedWinrate(((wins * 100) / total).toFixed(2))
      setProfile(finalAll)
      setHide(false)
    }
  }

  const timeloadall = async () => {
    var loadC = 0
    var showCount = 250
    if (loading) {
      // offset=900&&
      var tempres = []
      // for (let i = 0; i < players.length; i++) {
      await Promise.all(
        players.map(async (element, index) => {
          await fetch(
            "https://api.opendota.com/api/players/" +
              getPlayerID(element) +
              "/matches/?lobby_type=7",
            {
              method: "get",
            }
          )
            .then(async (res) => {
              if (res.status === 401) {
                setWrong(true)
              } else {
                return await res.json()
              }
            })
            .then(async (r) => {
              var temp = []
              console.log("r")
              console.log(r)
              if (r == undefined) {
                r = []
              }
              r = r.reverse()
              for (let i = 0; i < r.length; i++) {
                const element = r[i]
                if (element.lobby_type == 7) {
                  temp.push(element)
                }
              }
              console.log("temp")
              console.log(temp)
              tempres.push({ name: element, games: temp })
              loadC++
            })
        })
      )
      // const playerID = getPlayerID(players[i])
      // fetch(
      //   "https://api.opendota.com/api/players/" +
      //     playerID +
      //     "/matches/?lobby_type=7",
      //   {
      //     method: "get",
      //   }
      // )
      //   .then(async (res) => {
      //     if (res.status === 401) {
      //       setWrong(true)
      //     } else {
      //       return await res.json()
      //     }
      //   })
      //   .then(async (r) => {
      //     var temp = []
      //     console.log("r")
      //     console.log(r)
      //     r = r.reverse()
      //     for (let i = 0; i < r.length; i++) {
      //       const element = r[i]
      //       if (element.lobby_type == 7) {
      //         temp.push(element)
      //       }
      //     }
      //     console.log("temp")
      //     console.log(temp)
      //     tempres.push({ name: players[i], games: temp })
      //     loadC++
      //   })
      // }

      console.log("tempres")
      console.log(tempres)
      setResults(tempres)
      setLoading(false)
    }
    if (!loading) {
      var tempAllData = []
      var wins = 0
      var total = 0
      var gridDates = []

      for (let i = 0; i < results.length; i++) {
        var d = results[i].games
        var player = i
        var tempdata = {}
        var mmr = getBaseMMR(results[i].name)
        var rankedMatches = 0

        //data management for analysis
        for (let i = 0; i < d.length; i++) {
          const game = d[i]
          var date = new Date(game.start_time * 1000)
          const lose =
            (game.radiant_win && game.player_slot > 127) ||
            (!game.radiant_win && game.player_slot < 128)
          const leave = game.leaver_status == 1
        }

        //main loop
        var data = []
        var today = new Date(new Date().setHours(24, 0, 0, 0))
        var counter = 0
        for (let i = showCount; i >= 0; i--) {
          // console.log("day " + i)
          var day = new Date(today - i * 86400000)
          for (; counter < d.length; counter++) {
            // console.log("counter:" + counter)
            const game = d[counter]
            // console.log(game.start_time + " " + (day.getTime() / 1000 - 86400))
            if (game.start_time > ~~((day.getTime() + 86400000) / 1000)) break
            // console.log("game")
            var date = new Date(game.start_time * 1000)
            const lose =
              (game.radiant_win && game.player_slot > 127) ||
              (!game.radiant_win && game.player_slot < 128)
            const leave = game.leaver_status == 1
            // if (game.party_size == null) {
            //   fetch("https://api.opendota.com/api/request/" + game.match_id)
            //   console.log("null! " + game.match_id)
            // }
            var mmrChange = game.party_size == 1 ? 30 : 20
            rankedMatches += 1

            if (lose || leave) {
              mmrChange = -mmrChange
            }
            mmr += mmrChange
            maxmmr = maxmmr > mmr ? maxmmr : mmr
            var hour = 21,
              hourdif = 1
            if (date.getHours() >= hour && date.getHours() <= hour + hourdif) {
              wins += Math.sign(mmrChange) > 0 ? 1 : 0
              total += 1
            }
          }

          if (i < showCount) {
            localmaxmmr = localmaxmmr > mmr ? localmaxmmr : mmr
            data.push({
              mmr: mmr,
            })
            if (player == 0)
              gridDates.push({
                date:
                  day.getDate() +
                  "/" +
                  (day.getMonth() + 1) +
                  "/" +
                  day.getFullYear(),
              })
          }
        }
        //after one player
        tempAllData.push({ name: results[i].name, data: data })
      }

      //after all results

      //data management for analysis
      var res = ""
      setRankedWinrate("-")

      //34666
      console.log("tempAllData")
      console.log(tempAllData)
      var temp = [
        0, 154, 308, 462, 616, 770, 924, 1078, 1232, 1386, 1540, 1694, 1848,
        2002, 2156, 2310, 2464, 2618, 2772, 2926, 3080, 3234, 3388, 3542, 3696,
        3850, 4004, 4158, 4312, 4466, 4620, 4820, 5020, 5220, 5420, 9999,
      ]
      for (let i = 0; i < d.length; i++) {
        if (localmaxmmr >= temp[i]) ticks.push(temp[i + 1])
      }
      var finalAll = []
      for (let index = 0; index < showCount - 1; index++) {
        let t = {}
        for (let j = 0; j < tempAllData.length; j++) {
          if (tempAllData[j].data[index])
            t[tempAllData[j].name] = tempAllData[j].data[index].mmr
        }
        t["date"] = gridDates[index].date
        finalAll.push(t)
      }
      console.log(finalAll)
      console.log("LMM:" + localmaxmmr)
      console.log(ticks)
      // setRankedWinrate(((wins * 100) / total).toFixed(2))
      setProfile(finalAll)
      setHide(false)
    }
  }

  //time graph
  const loadtime = async () => {
    var loadC = 0
    if (loading) {
      // offset=900&&
      var tempres = []
      // for (let i = 0; i < players.length; i++) {
      await Promise.all(
        ["mpowend"].map(async (element, index) => {
          await fetch(
            "https://api.opendota.com/api/players/" +
              getPlayerID(element) +
              "/matches/?lobby_type=7",
            {
              method: "get",
            }
          )
            .then(async (res) => {
              if (res.status === 401) {
                setWrong(true)
              } else {
                return await res.json()
              }
            })
            .then(async (r) => {
              var temp = []
              console.log("r")
              console.log(r)
              if (r == undefined) {
                r = []
              }
              r = r.reverse()
              for (let i = 0; i < r.length; i++) {
                const element = r[i]
                if (element.lobby_type == 7) {
                  temp.push(element)
                }
              }
              console.log("temp")
              console.log(temp)
              tempres.push({ name: element, games: temp })
              loadC++
            })
        })
      )

      console.log("tempres")
      console.log(tempres)
      setResults(tempres)
      setLoading(false)
    }
    if (!loading) {
      var tempAllData = []

      //data management for analysis
      const interval = 60
      var windata = new Array(7).fill(0)
      var totaldata = new Array(7).fill(0)

      for (let i = 0; i < results.length; i++) {
        if (true) {
          var d = results[i].games
          var tempdata = {}
          var mmr = getBaseMMR(results[i].name)
          var rankedMatches = 0

          //data management for analysis
          for (let i = 0; i < d.length; i++) {
            const game = d[i]
            var date = new Date(game.start_time * 1000)
            const lose =
              (game.radiant_win && game.player_slot > 127) ||
              (!game.radiant_win && game.player_slot < 128)
            const leave = game.leaver_status == 1

            // console.log("date")
            // console.log(
            //   date.getHours() * (60 / interval) +
            //     Math.floor(date.getMinutes() / interval) +
            //     "   " +
            //     date.getHours() +
            //     ":" +
            //     date.getMinutes()
            // )
            totaldata[
              (date.getDay()+1 + 7) % 7
            ] += 1
            if (lose || leave) {
              // windata[date.getHours()] -= 1
            } else {
              windata[
                (date.getDay()+1 + 7) % 7
              ] += 1
            }
          }
        }
      }

      //after all results

      console.log("windata")
      console.log(windata)
      console.log("totaldata")
      console.log(totaldata)
      //data management for analysis
      var max = [0,0]
      for (let i = 0; i < windata.length; i++) {
        if(max[1] < ((windata[i] * 100) / totaldata[i]).toFixed(2)){
          max = [i, ((windata[i] * 100) / totaldata[i]).toFixed(2)]
        }
        data.push({
          date: i,
          mmr: ((windata[i] * 100) / totaldata[i]).toFixed(2),
          total: totaldata[i],
        })
      }
      setRankedWinrate(max[0] + " (" + max[1] + "%)")

      //34666
      console.log("tempAllData")
      console.log(tempAllData)
      ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      console.log(data)
      console.log("LMM:" + localmaxmmr)
      console.log(ticks)
      // setRankedWinrate(((wins * 100) / total).toFixed(2))
      setProfile(data)
      setHide(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      console.log(payload)
      var percent = payload.find((element) => element.name == "mmr").value
      var games = payload.find((element) => element.name == "total").value
      return (
        <div
          className="custom-tooltip"
          style={{
            borderRadius: 10,
            padding: "8px",
            width: "100px",
            height: "100px",
            backgroundColor: "#ffffffaf",
          }}
        >
          <p className="label">{`${label} : ${payload[0].value}`}</p>
          <p className="intro"></p>
          <p className="desc">Anything you want can be displayed here.</p>
        </div>
      )
    }

    return null
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      width = window.innerWidth
      height = window.innerHeight
    }
    if (player == "all") gameloadall()
    else if (player == "alldate") timeloadall()
    else if (player == "time") loadtime()
    else load()
  }, [hide, loading])

  var refresh = () => {
    maxmmr = 0
    localmaxmmr = 0
    ticks = []
    data = []
    setLoading(true)
    setHide(true)
  }
  return (
    <ThemeProvider theme={theme}>
    <div className={styles.container}>
      <ButtonGroup color="secondary">
        <Button
          variant={player == "mpowend" ? "contained" : "outlined"}
          disabled={loading ? true : false}
          onClick={() => {
            setPlayer("mpowend")
            refresh()
          }}
        >
          Mpowend
        </Button>
        <Button
          variant={player == "teramir" ? "contained" : "outlined"}
          disabled={loading ? true : false}
          onClick={() => {
            setPlayer("teramir")
            refresh()
          }}
        >
          Teramir
        </Button>
        <Button
          variant={player == "darjaryan" ? "contained" : "outlined"}
          disabled={loading ? true : false}
          onClick={() => {
            setPlayer("darjaryan")
            refresh()
          }}
        >
          Darjaryan
        </Button>
        {/* <Button
          variant={player == "netflix" ? "contained" : "outlined"}
          disabled={loading ? true : false}
          onClick={() => {
            setPlayer("netflix")
            refresh()
          }}
        >
          Netflix
        </Button> */}
        <Button
          variant={player == "lim" ? "contained" : "outlined"}
          disabled={loading ? true : false}
          onClick={() => {
            setPlayer("lim")
            refresh()
          }}
        >
          Lim
        </Button>
        {/* <Button
          variant={player == "forlorn" ? "contained" : "outlined"}
          disabled={loading ? true : false}
          onClick={() => {
            setPlayer("forlorn")
            refresh()
          }}
        >
          Forlorn
        </Button> */}
        <Button
          variant={player == "all" ? "contained" : "outlined"}
          disabled={loading ? true : false}
          onClick={() => {
            setPlayer("all")
            refresh()
          }}
        >
          All (by game)
        </Button>
        <Button
          variant={player == "alldate" ? "contained" : "outlined"}
          disabled={loading ? true : false}
          onClick={() => {
            setPlayer("alldate")
            refresh()
          }}
        >
          All (by date)
        </Button>
        <Button
          variant={player == "time" ? "contained" : "outlined"}
          disabled={loading ? true : false}
          onClick={() => {
            setPlayer("time")
            refresh()
          }}
        >
          Time analysis
        </Button>
      </ButtonGroup>
      {hide ? (
        <div style={
          {
            "height" : "85vh",
            "display" : "flex",
            "justifyContent": "center",
            "alignItems": "center"
          }
        }>
        <PacmanLoader
          color="#AAAAAA"
          height={height * 0.45}
          width={width * 0.1}
          className={styles.loading}
        />
        </div>
      ) : (
        <LineChart
          id="main-chart"
          width={width * 0.95}
          height={height * 0.85}
          data={profile}
          margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
        >
          <XAxis
            dataKey="date"
            interval={
              player == "time" ? profile.length / 24 - 1 : "preserveEnd"
            }
          />
          <YAxis ticks={ticks} domain={[0, ticks[ticks.length - 1]]} />
          {player == "time" ? (
            <Tooltip />
          ) : (
            /*content={<CustomTooltip />} />*/
            <Tooltip />
          )
          }
          {/*<defs>
            <linearGradient
                    id="splitColor"
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="0"
                  >
                    {profile &&
                      profile.map((element, index) => {
                        var off = (index / (profile.length - 1)).toFixed(10)
                        console.log(profile.length)
                        if (index != profile.length - 1)
                          return (
                            <React.Fragment key={index}>
                              <stop
                                offset={off}
                                stopColor={element.win ? "#27ae60" : "#ff3838"}
                                stopOpacity={1}
                              />
                              <stop
                                offset={parseFloat(off) + 0.0000000001}
                                stopColor={
                                  profile[index + 1] && profile[index + 1].win
                                    ? "#16a085"
                                    : "#ff3838"
                                }
                                stopOpacity={1}
                              />
                            </React.Fragment>
                          )
                        else {
                          return (
                            <stop
                              offset={off}
                              stopColor={element.win ? "green" : "red"}
                              stopOpacity={1}
                            />
                          )
                        }
                      })}
                  </linearGradient> 
          </defs> */}
          {player == "time" ? (
            <CartesianGrid
              strokeDasharray="1 5"
              stroke="#bdc3c7"
              horizontalPoints={[]}
            />
          ) : (
            null
          )}
          {player != "all" && player != "alldate" ? (
            <React.Fragment>
              <Line
                type="monotone"
                dataKey="mmr"
                // stroke="url(#splitColor)"
                stroke="#e67e22"
                yAxisId={0}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="party"
                stroke="#4a69bd"
                yAxisId={0}
                dot={false}
              />
              {player == "time" ? (
                <Line
                  type="monotone"
                  dataKey="total"
                  // stroke="url(#splitColor)"
                  stroke="#3498db"
                  yAxisId={0}
                  dot={false}
                />
              ) : (
                null
              )}
            </React.Fragment>
          ) : (
            players.map((element, index) => {
              return (
                <Line
                  key={element}
                  type="monotone"
                  dataKey={element}
                  stroke={colors[index]}
                  yAxisId={0}
                  dot={false}
                />
              )
            })
          )}

          {/* <ReferenceLine
              y={0}
              // label="H I"
              stroke="#6da035"
              strokeDasharray="3 3"
            /> */}
          <ReferenceLine
            y={154}
            label="H II"
            stroke="#6da035"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={308}
            label="H III"
            stroke="#6da035"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={462}
            label="H IV"
            stroke="#6da035"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={616}
            label="H V"
            stroke="#6da035"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={770}
            label="G I"
            stroke="#764c2b"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={924}
            label="G II"
            stroke="#764c2b"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={1078}
            label="G III"
            stroke="#764c2b"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={1232}
            label="G IV"
            stroke="#764c2b"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={1386}
            label="G V"
            stroke="#764c2b"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={1540}
            label="C I"
            stroke="#138c8b"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={1694}
            label="C II"
            stroke="#138c8b"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={1848}
            label="C III"
            stroke="#138c8b"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={2002}
            label="C IV"
            stroke="#138c8b"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={2156}
            label="C V"
            stroke="#138c8b"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={2310}
            label="A I"
            stroke="#229271"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={2464}
            label="A II"
            stroke="#229271"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={2618}
            label="A III"
            stroke="#229271"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={2772}
            label="A IV"
            stroke="#229271"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={2926}
            label="A V"
            stroke="#229271"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={3080}
            label="L I"
            stroke="#8a1631"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={3234}
            label="L II"
            stroke="#8a1631"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={3388}
            label="L III"
            stroke="#8a1631"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={3542}
            label="L IV"
            stroke="#8a1631"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={3696}
            label="L V"
            stroke="#8a1631"
            strokeDasharray="3 3"
          />

          {/* <Line type="monotone" dataKey="pv" stroke="#387908" yAxisId={1} /> */}
        </LineChart>
      )
      }

      <div className={styles.info}>
        <Chip label={"Winrate: " + rankedWinrate + "%"} color="primary" />
        <Chip label={"highest mmr: " + maxmmr} color="primary" />
        <Chip
          label={
            "Current rank: " +
            (profile &&
              profile[profile.length - 1] &&
              profile[profile.length - 1].mmr)
          }
          color="secondary"
        />
      </div>
    </div>
    </ThemeProvider>
  )
}
