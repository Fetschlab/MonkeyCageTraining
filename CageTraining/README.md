Steps in setting up new CageTraining folder
0. Install JavaScript: https://nodejs.org/en/

1. cd C:\Users\<USERNAME>\Desktop
2. mkdir MonkeyCageTraining
3. git clone https://github.com/Fetschlab/MonkeyCageTraining.git
4. cd CageTraining
5. npm install
6. npm install -g create-react-app
7. npm start // test functionality
8. CTRL+C; Y // exit window
9. npm run build
10. cd build
11. Copy contents of build folder into webdav folder.

Visit http://localhost:3000/?monkey=MonkeyName&task=touch
Replace 'MonkeyName' with the name of your monkey
Replace 'touch' with 'dots' to switch to dots task

If hosting on another server, change link in `package.json`

Fetsch lab uses Github to store changes:
https://github.com/Fetschlab/MonkeyCageTraining

To change the type of task (until a GUI is added):
  - Navigate into CageTraining/public/manifest.json
  - Find the "start_url" and change the type of task
  - Run 'npm run build' and copy the build folder to server
  - Enter the new URL defined earlier
