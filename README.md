

## TODO List

Your Render (or alternative server) link e.g. 
pleasant-benevolence-database.up.railway.app



Include a very brief summary of your project here. Images are encouraged, along with concise, high-level text. Be sure to include:

- the goal of the application
- challenges you faced in realizing the application
- what authentication strategy you chose to use and why (choosing one because it seemed the easiest to implement is perfectly acceptable)
- what CSS framework you used and why
  - include any modifications to the CSS framework you made via custom CSS you authored
- a list of Express middleware packages you used and a short (one sentence) summary of what each one does. If you use a custom function, please add a little more detail about what it does.

## Technical Achievements
5 points for host the project on railway.io
- **Tech Achievement 1**: 
  - the goal for this assignment is the same as A2, make a todo list. However, this version can let user register account and only view their own list
  - Implemented the website through railway.io instead of render
  - Most challenge I faced is about dealing with database, how to connect it and how to modify it. Another one is the data structure. Because I choose to put user's todolist inside user object, so sometime it will be hard to modify user's list
  - The authentication I use is the most simple one, use username pair with password. I do implement hash password to increase security of user
  - I use bootstrap as my framework for this assignment, because it has many prebuild library and easy to use for beginner
  - Middleware
    - cookie-session: use to store user login
    - mongoclient: connect with database
    - static file: access file from public
    - url encoded: parse form submission into request
    - json body parser: parse json into post

### Design/Evaluation Achievements
- **Design Achievement 1**: I followed the following tips from the W3C Web Accessibility Initiative...
  - made sufficient contrast between foreground and background
  - user can visually identify element that are interactable
  - Application functionality can easily be identify
  - 

url: pleasant-benevolence-database.up.railway.app
