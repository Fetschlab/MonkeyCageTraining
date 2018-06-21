How to develop this thing?
  - Go to the Documents/MonkeyCageTraining folder
  - Type `npm start`
  - Visit http://localhost:3000/?monkey=MonkeyName&task=touch
  - Replace 'MonkeyName' with the name of your monkey

If hosting on another server, change link in `package.json`

After changing code: `npm run build`

Fetsch lab uses Github to store changes:
https://github.com/crfetsch/MonkeyCageTraining

To change the type of task (until a GUI is added):
  - Navigate into CageTraining/public/manifest.json
  - Find the "start_url" and change the type of task
  - Run 'npm run build' and copy the build folder to server
  - Enter the new URL defined earlier
