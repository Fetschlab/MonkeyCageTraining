How to develop this thing?
  - Go to the Documents/MonkeyCageTraining folder
  - Type `npm start`
  - Visit http://localhost:3000/?monkey=MonkeyName&task=touch
  - Replace 'MonkeyName' with the name of your monkey

If hosting on another server, change link in `package.json`

After changing code: `npm run build`
To copy changed code to the server:
```
cd build
scp -r * danique@shadlenlab.columbia.edu:/mnt/danique
```
