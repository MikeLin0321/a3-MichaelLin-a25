// FRONT-END (CLIENT) JAVASCRIPT HERE

const renderTable = function(data) {
  const table = document.querySelector("#todoTable")
  table.innerHTML = `<tr>
        <th>Due Date</th>
        <th>Done</th>
        <th>Days Remaining</th>
        <th>Thing</th>
        <th>Delete</th>
      </tr>`
  for( let item of data ) {
    const today = new Date()
    const dueDate = new Date(item.date)
    let dayRemaining
    if(item.done){
      dayRemaining = "Done"
    } else if(dueDate < today){
      dayRemaining = "Overdue"
    } else {
      const diffTime = Math.abs(dueDate - today)
      dayRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    item.dayRemaining = dayRemaining
    const row = document.createElement("tr")
    row.innerHTML = `<td>${item.date}</td>
                     <td><input type="checkbox" ${item.done ? "checked" : ""} onchange="doneThing('${item.id}', this.checked)"></td>
                     <td>${dayRemaining}</td>
                     <td class="editable-cell" onclick="editThing('${item.id}')" title="Click to edit">${item.thing}</td>
                     <td><button onclick="deleteItem('${item.id}')">Delete</button></td>`
    table.appendChild(row)
  }
}

const loadData = async function() {
  const response = await fetch( "/todos" )
  const data = await response.json()
  console.log(data)
  renderTable(data)
}

loadData()

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const date = document.querySelector( "#eventDate" ),
        thing = document.querySelector( "#eventThing" )

  if ( date.value === "" || thing.value === "" ) {
    alert( "Please fill in both fields." )
    return
  }
  const json = { date: date.value, thing: thing.value, done: false },
        body = JSON.stringify( json ),
        form = document.querySelector("form")

  const response = await fetch( "/todos", {
    method:"POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body 
  })

  form.reset()

  const data = await response.json();
  console.log(data)
  renderTable(data)
}



const deleteItem = async function(id) {
  const json = { id: id },
        body = JSON.stringify( json )
  console.log( "body:", body )
  const response = await fetch( "/delete", {
    method:"DELETE",
    headers: { 'Content-Type': 'application/json' },
    body 
  })

  const text = await response.json()
  console.log( "text:", text )

  renderTable(text)
}

const doneThing = async function(id) {

  const response = await fetch( `/done/${id}`, {
    method:"POST",
  })

  const text = await response.text()
  console.log( "text:", text )

  const data = JSON.parse(text)
  renderTable(data)
}

const editThing = async function(id) {

  const response = await fetch( `/edit/${id}`, {
    method:"GET",
  })

  const text = await response.text()
  console.log( "text:", text )

  window.location.href = `/edit?id=${encodeURIComponent(id)}`;
}

window.onload = function() {
  const button = document.querySelector("#submitData");
  button.onclick = submit;
}