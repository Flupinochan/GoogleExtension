AppData\Local\Tempに増え続けるので注意
clean-wxt-temp.jsで削除
"predev": "node clean-wxt-temp.js",
"prebuild": "node clean-wxt-temp.js"


```bash
git push --force-with-lease origin master
```