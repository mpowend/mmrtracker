import React from "react"
import { useContext, useEffect, useState } from "react"
import styles from "../styles/chart.module.scss"
import { useRouter } from "next/router"
import Router from "next/router"
import { AppContext } from "../context/state"
import { useCookies } from "react-cookie"
import ReactLoading from "react-loading"
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ReferenceLine,
} from "recharts"
import { Button, ButtonGroup, Chip, Divider } from "@material-ui/core"

var maxmmr = 0
var localmaxmmr = 0
var ticks = []
var showCount = 250
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
  const [rankedMatchCount, setRankedMatchCount] = useState()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchList, setSearchList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [player, setPlayer] = useState("mpowend")
  const [cookies, setCookie] = useCookies(["userid", "token"])
  const [p, setp] = useState()

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
      // offset=900&&

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
      var rankedMatches = 0
      for (let i = 0; i < d.length; i++) {
        const game = d[i]
        var date = new Date(game.start_time * 1000)
        const lose =
          (game.radiant_win && game.player_slot > 127) ||
          (!game.radiant_win && game.player_slot < 128)
        const leave = game.leaver_status == 1
        var mmrChange = game.party_size == 1 ? 30 : 20
        rankedMatches += 1

        if (lose || leave) {
          mmrChange = -mmrChange
        }
        mmr += mmrChange
        maxmmr = maxmmr > mmr ? maxmmr : mmr

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
      setRankedMatchCount(rankedMatches)
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
        return 1240
      case "teramir":
        return 1340
      case "darjaryan":
        return 980
      case "lim":
        return 150
      case "forlorn":
        return 2320
      case "netflix":
        return 2320
      default:
        return 0
    }
  }

  //all players in the same graph

  const loadall = async () => {
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

      for (let i = 0; i < results.length; i++) {
        var d = results[i].games
        var tempdata = {}
        var mmr = getBaseMMR(results[i].name)
        var rankedMatches = 0
        var data = []
        for (let i = 0; i < d.length; i++) {
          const game = d[i]
          var date = new Date(game.start_time * 1000)
          const lose =
            (game.radiant_win && game.player_slot > 127) ||
            (!game.radiant_win && game.player_slot < 128)
          const leave = game.leaver_status == 1
          var mmrChange = game.party_size == 1 ? 30 : 20
          rankedMatches += 1

          if (lose || leave) {
            mmrChange = -mmrChange
          }
          mmr += mmrChange
          maxmmr = maxmmr > mmr ? maxmmr : mmr

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
      setRankedMatchCount(rankedMatches)
      setProfile(finalAll)
      setHide(false)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      width = window.innerWidth
      height = window.innerHeight
    }
    if (player != "all") load()
    else loadall()
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
        <Button
          variant={player == "netflix" ? "contained" : "outlined"}
          disabled={loading ? true : false}
          onClick={() => {
            setPlayer("netflix")
            refresh()
          }}
        >
          Netflix
        </Button>
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
        <Button
          variant={player == "forlorn" ? "contained" : "outlined"}
          disabled={loading ? true : false}
          onClick={() => {
            setPlayer("forlorn")
            refresh()
          }}
        >
          Forlorn
        </Button>
        <Button
          variant={player == "all" ? "contained" : "outlined"}
          disabled={loading ? true : false}
          onClick={() => {
            setPlayer("all")
            refresh()
          }}
        >
          All (beta)
        </Button>
      </ButtonGroup>
      {hide ? (
        <ReactLoading
          type="bars"
          color="#11111155"
          height={height * 0.85}
          width={width * 0.4}
          className={styles.loading}
        />
      ) : (
        <LineChart
          id="main-chart"
          width={width * 0.95}
          height={height * 0.85}
          data={profile}
          margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
        >
          <XAxis dataKey="date" />
          <YAxis ticks={ticks} domain={[0, ticks[ticks.length - 1]]} />
          <Tooltip />
          <defs>
            {/* <linearGradient
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
                  </linearGradient> */}
          </defs>
          {/* <CartesianGrid strokeDasharray="1 10" stroke="#bdc3c7" /> */}
          {player != "all" ? (
            <React.Fragment>
              <Line
                type="monotone"
                dataKey="mmr"
                // stroke="url(#splitColor)"
                stroke="#fed330"
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
      )}

      <div className={styles.info}>
        <Chip
          label={"new ranked matches: " + rankedMatchCount}
          color="primary"
        />
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
  )
}
