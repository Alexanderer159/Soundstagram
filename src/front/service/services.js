const register = async (email, password) => {
    const resp = await fetch(`https://your_api.com/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
     })
     if(!resp.ok) throw Error("There was a problem in the register request")
}

const login = async (email, password) => {
     const resp = await fetch(`https://your_api.com/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
     })

     if(!resp.ok) throw Error("There was a problem in the login request")

     if(resp.status === 401){
          throw("Invalid credentials")
     }
     else if(resp.status === 400){
          throw ("Invalid email or password format")
     }
     const data = await resp.json()
    
     localStorage.setItem("jwt-token", data.token);

     return data
}