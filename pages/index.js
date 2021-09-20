import React from "react"
import { useContext, useEffect, useState } from "react"
import styles from "../styles/chart.module.scss"
import { useRouter } from "next/router"
import Router from "next/router"
import { AppContext } from "../context/state"
import { useCookies } from "react-cookie"
import ReactLoading from "react-loading"
import { LineChart, XAxis, YAxis, Tooltip, CartesianGrid, Line } from "recharts"
import { Button, ButtonGroup, Chip, Divider } from "@material-ui/core"

var maxmmr = 0
var width = 1920
var height = 1080
export default function Chart(props) {
  const { setCourse, backip } = useContext(AppContext)
  const [loading, setLoading] = useState(true)
  const [hide, setHide] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [results, setResults] = useState()
  const [profile, setProfile] = useState()
  const [time, setTime] = useState()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchList, setSearchList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [player, setPlayer] = useState("mpowend")
  const [cookies, setCookie] = useCookies(["userid", "token"])
  const [p, setp] = useState()

  console.log(loading)

  var data = []

  var load = () => {
    if (loading) {
      // offset=900&&

      var playerID = 358792797
      switch (player) {
        case "mpowend":
          var playerID = 358792797
          break
        case "teramir":
          var playerID = 210899035
          break
        case "darjaryan":
          var playerID = 491280560
          break
        default:
          break
      }
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
            const element = r[i]
            if (element.lobby_type == 7) {
              temp.push(element)
            }
          }
          console.log("temp")
          console.log(temp)
          setResults(temp)
          setLoading(false)
        })
    }
    if (!loading) {
      var d = results

      //mpowend 1240
      //teramir 1340

      //puyan now 1240
      var mmr = 0
      switch (player) {
        case "mpowend":
          mmr = 1240
          break
        case "teramir":
          mmr = 1340
          break
        case "darjaryan":
          mmr = 980
          break
        default:
          break
      }
      var ttime = 0
      for (let i = 0; i < d.length; i++) {
        const game = d[i]
        var date = new Date(game.start_time * 1000)
        const lose =
          (game.radiant_win && game.player_slot > 127) ||
          (!game.radiant_win && game.player_slot < 128)
        const leave = game.leaver_status == 1
        var mmrChange = game.party_size == 1 ? 30 : 20
        ttime += 1

        if (lose || leave) {
          mmrChange = -mmrChange
        }
        mmr += mmrChange
        maxmmr = maxmmr > mmr ? maxmmr : mmr

        if (i > d.length - 200)
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
      console.log(d)
      setTime(ttime)
      setProfile(data)
      setHide(false)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      width = window.innerWidth
      height = window.innerHeight
    }
    load()
  }, [hide, loading])

  var refresh = () => {
    maxmmr = 0
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
          margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
        >
          <XAxis dataKey="date" />
          <YAxis tickCount={8} />
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
          <CartesianGrid strokeDasharray="1 10" stroke="#bdc3c7" />
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
          {/* <Line type="monotone" dataKey="pv" stroke="#387908" yAxisId={1} /> */}
        </LineChart>
      )}

      <div className={styles.info}>
        <Chip label={"new ranked matches: " + time} color="primary" />
        <Chip label={"highest mmr: " + maxmmr} color="primary" />
        <Chip
          label={
            "Current rank: " + (profile && profile[profile.length - 1].mmr)
          }
          color="secondary"
        />
      </div>
    </div>
  )
}
