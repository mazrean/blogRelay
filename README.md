## traPのブログリレー用のGASのリポジトリ
ただのブログリレーのためのスクリプトには†過剰なほどに強強†のGASの開発環境。
CIによるlint,test（これから入れる）,deployが入っている。
### セットアップ
#### ローカル
```bash
$ yarn install
$ yarn global add @google/clasp
$ clasp login #Googleの認証画面が出る
```
`~/.clasp.json`を
```json ~/.clasp.json
{
    "scriptId":"xxxxxxxxx",
    "rootDir": "src/",
    "fileExtension": "ts"
}
```
のように書き換える（scriptIdは書き換えるスクリプトのscriptIdを入れる）。

#### Github
SECRETのCLASPに`~/.claps.json`の中身を、CLASPRCに`~/.clasprc.json`の中身を入れる。

### 使い方
masterへのpushでdeploy、すべてのブランチへのpushでtest,lintが走る。
また、
```bash
$ clasp push
$ clasp deploy
```
で手元でデプロイできる。

### 注意
```bash
$ clasp pull
```
をすると手元のsrcディレクトリの中身がトランパイル後のjsのコードで上書きされてしまうので、できる限りしないほうがいい。
