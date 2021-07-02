# 坂道blog下載
快速打包blog 含文章及圖片
# 功能
下載坂道系blog，可依  
團體-成員  
選取自訂頁碼下載blog
會依照發布時間生成資料夾  
放入文章(html)  
(\*圖片連結官方若刪掉即消失)  
及圖片

# 使用
## 直接使用exe file
(若不需要自己修改下載exe即可)
1. 進入對應團體資料夾，並依著執行環境則對應.exe執行
ex :乃木坂  
+ nogizaka  
 ---nogi-win.exe  
 ---nogi-macos.exe  
 ---nnogi-linux.exe  
2. 櫻坂賀卡，進入cards資料夾並依著執行環境則對應.exe執行
+ cards  
 ---cards-win.exe  
 ---cards-macos.exe  
 ---cards-linux.exe  
### note
+ 乃木坂需輸入成員羅馬拼音，執行檔中有提示  
+ 櫻、櫸、日向坂需輸入成員編號，執行檔中有提示  
+ 部落格頁數為網站上的分頁
+ 頁數太多建議分頁下載
+ 若有成員有發新部落格，頁數都選 "1"即可，不會重複下載已下載過的blog
+ 櫻坂每月賀卡每月更新時，記得將資料夾改名，以免執行後遭到覆蓋
+ macos 需解決權限問題請自行google

## nodejs 中執行
### 環境建置與需求
    "node.js": "v10.15.0"
    "axios": "^0.21.1"
    "download": "^8.0.0"
    "inquirer": "^8.0.0"
    "jsdom": "^16.5.3"
    "mkdirp": "^1.0.4"
    "prompt": "^1.1.0"
### 安裝與使用
#### 下載專案
git clone https://github.com/zhihdd/sakamichi_blog-downloader.git
or
右上方 "code" 下載

#### 安裝套件
```
npm install
```
#### 使用 

下載乃木坂blogs
```
npm run nogi 
```
下載櫸坂blogs
```
npm run keya 
```
下載櫻坂blogs
```
npm run saku 
```
下載日向坂blogs
```
npm run hinata 
```
下載櫻坂每月賀卡
```
npm run cards 
```






