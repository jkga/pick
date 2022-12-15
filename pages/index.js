import Head from 'next/head'
import Image from '../components/imageLoader'
import styles from '../styles/Home.module.css'
import logo from '../public/logo.png'
import { useState } from 'react'

export default function Home() {

  const [files, setFiles] = useState([])
  const [uploadButtonHidden, setUploadButtonHidden] = useState(false)
  const [drawButtonHidden, setDrawButtonHidden] = useState(false)
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [winners, setWinners] = useState([])
  const [currentWinner, setCurrentWinner] = useState(null)
  const [removeDrawnItems, setRemoveDrawnItems] = useState(true)


  const randomIntBetween = (min,max) => {
    return Math.floor(Math.random()*(max - min + 1)) + min
  }

  const showPoppers = (display = true) => {
    if(document) {
      let poppers = document.querySelectorAll(".poppers")
      poppers.forEach((el, index) => {
        el.style.display = display ? 'block' : 'none'
      })
    }
  }
  
  const animateDraw = () => {
    // disable buttons
    setDrawButtonHidden(true)

    // play drum audio
    if(document) {
      document.querySelector(".drumroll").play()
      showPoppers(false)
    }

    let fileLength = files.length

      //remove drawn items checkboox is selected
    if(removeDrawnItems) {
      
      const newFiles = Array.from(files).filter((el, index) => index !== currentWinner)
      fileLength = newFiles.length

      setFiles(newFiles)

    }
    

    setTimeout(() => {
      drawRandom(fileLength > 1 ? (fileLength - 1) : 0)
    }, 10)
   
  }

  const drawRandom = (pass) => {
    const numbers = []
    const numberOfPassNeeded = pass >= 4 ? 4 : pass
    
    for(let x = 0; x <= numberOfPassNeeded; x++) {
      let rand = randomIntBetween(0, pass)
      if(numbers.indexOf(rand) === -1) {
        numbers.push(rand)
      } else {
        numbers.push(randomIntBetween(0, pass))
      }
    }

    setTimeout(() => {
      // show random results
      let num = 0
      let timeout = setInterval(() => {
        if(numbers[num] !== undefined) {
          setSelectedFileIndex(numbers[num])
          num++
        } else {
          //stop showing fake results
          clearInterval(timeout)
          // show true value
          const winner = randomIntBetween(0, pass)
          setSelectedFileIndex(winner)
          setCurrentWinner(winner)

          // enable draw button
          setDrawButtonHidden(false)

          // stop drum audio and show animations
          if(document) {
            const drumAudio = document.querySelector(".drumroll")
            const winnerAudio = document.querySelector(".winner")
            drumAudio.pause()
            drumAudio.currentTime = 0

            setTimeout(() => {
              winnerAudio.play() 
              showPoppers(true)
            ,500})
          }
        }

      }, 800)
    }, 10)

  }

  const selectUpload = (e) => {
    // clear memory
    setFiles([])
    setWinners([])
    setCurrentWinner(null)
    setSelectedFileIndex(0)

    //hide button
    setUploadButtonHidden(true)

    //new reader
    let targetFiles = e.target.files
    let selectedFiles = []

    for(let filex of targetFiles) {

      const reader = new FileReader()
      reader.readAsDataURL(filex)
    
      // load from file
      reader.addEventListener('load', (e) => {
        const data = e.target.result
        selectedFiles.push(data)
        setFiles([...selectedFiles])
      })
    
      reader.addEventListener('error', (e) => {
        console.log(e)
      })
    }
  
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Pick</title>
        <meta name="description" content="feeling lucky today!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Image src={logo} width="350px" height="200px" unoptimized/>
          <label className='btn btn-primary p2 rounded' style={{background: 'blue', color: '#fff', display: uploadButtonHidden ? 'none' : 'block'}}>
            <input type="file" multiple onChange={selectUpload}/>
            Please select file(s) to upload
          </label>

          {files && files.map((el, index) => {
            if(selectedFileIndex === index) {
              return <>
                <h1 className='mb-3'>#{index + 1}</h1>
                <img src={el} key={index} width="35%" style={{minWidth: '250px'}}/>
              </>
            }
          })}


          <button onClick={() => animateDraw() } className="mt-5 btn btn-success btn-lg" disabled={drawButtonHidden}>DRAW</button>

          <p>Total Items: {files.filter((el, index) => winners[index] === undefined).length}</p>
          <p>
            <input type='checkbox' checked={removeDrawnItems} onChange={() => setRemoveDrawnItems(!removeDrawnItems)}/> Remove drawn items&nbsp;
            <a href="#" onClick={() => setUploadButtonHidden (false)}>change file</a>
          </p>
      </main>

      <audio className='drumroll' preload="auto">
        <source src="./drumroll.mp3" type="audio/mp3"/>
        Your browser does not support the audio tag.
      </audio>

      <audio className='winner' preload="auto">
        <source src="./winner.webm" type="video/webm"/>
        Your browser does not support the audio tag.
      </audio>
      
      <div id={[styles.popperLeft]} className="poppers">
        <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_fnjH1K.json"  background="transparent"  speed="1"  style={{width: '40vh'}}  loop autoplay></lottie-player>
      </div>

      <div id={[styles.popperRight]} className="poppers">
        <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_fnjH1K.json"  background="transparent"  speed="1"  style={{width: '40vh'}}  loop autoplay></lottie-player>
      </div>
    </div>
  )
}
