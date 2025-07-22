window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('firstButton')
    btn.addEventListener('click', () => {
        alert('event registered')
    })
})

const func = async () => {
  const response = await window.versions.ping()
  console.log(response)
}

const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`

func()