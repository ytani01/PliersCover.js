# [PliersCover JavaScript](https://ytani01.github.io/PliersCover.js/)

工具カバーのレザークラフト用図面を自動作成 (JavaScript)

[![sample1](docs/sample1.png)](https://ytani01.github.io/PliersCover.js/pliers_cover.html)

## 概要

[Demo URL](https://ytani01.github.io/PliersCover.js/pliers_cover.html target="_blank")

<a href="https://ytani01.github.io/PliersCover.js/pliers_cover.html" target="_blank" rel="noopener">aaa</a>

ラジオペンチやニッパーなどの工具カバーのレザークラフト用図面を自動作成する
Inkscapeエクステンション(拡張機能)です。

各部分のサイズを入力すると、
レーザーカッターなどで利用できる図面を自動作成します。

(もちろん、紙に印刷して、従来通りの手作業も可能。)

ブラウザの画面上で確認しながらサイズを調整できます。

針穴は菱目で、位置は、必ず角に来るように自動的に調整されます。


## 1. インストール

1. ダウンロード
2. ファイルのコピー

### 1.1 ダウンロード

サイトのURL

[https://github.com/ytani01/PliersCover.js/](https://github.com/ytani01/PliersCover.js/)

ZIP形式のファイルをダウンロードして展開するか、
``git``に慣れている方は、慣れた方法でリポジトリをクローンしてください。

#### 1.1.1 ZIPファイルをダウンロードして展開する方法

![](docs/github1.png)


#### 1.1.2 Gitリポジトリをクローン(clone)する方法

* 通常のやり方

```bash
$ git clone https://github.com/ytani01/PlierCover.js.git
```

* githubにsshの設定をしている場合

```bash
$ git clone git@github.com:ytani01/PlierCover.js.git
```


### 1.2 ファイルのコピー

以下の２つのファイルを所定のフォルダにコピーする。

コピーするファイル
* plier_cover.html
* plier_cover.js

適当なフォルダ(ディレクトリ)にコピーして、
``plier_cover.html``をブラウザで開いて下さい。


## 2. 使い方

* 入力欄にサイズを入力

![Inkscape extension: 工具カバー](docs/sample1.png)

* 入力欄のどれでも変更すると、その場で直ちに、描画されます。

* ``[Create SVG]``ボタンでも表示できます。

* ``[Download SVG]``ボタンで、SVGファイルに保存することができます。


### 2.1 注意・コツなど

* 角に、針穴が来るように自動調節されるので、
辺ごとに針穴の間隔が多少不揃いになることがあります。
縫いしろや針穴のパラメータを微調整調整して、
針穴が均等になるようにしましょう。



## A. Memo

### A.1 SVG パスのコマンド

```
(大文字: 絶対座標、小文字: 相対座標)

M: moveto (始点座標)
L: lineto
  H: 水平
  V: 垂直
C: curveto: "{C|c} c1x,c1y c2x,c2y x,y"
  (c1x, c1y), (c2x, c2y): 制御点
  x,y: 終点

  * 正円(半円)の場合、制御点までの距離は、直径の約0,75倍(?)
Z: closepath
```

```
ex: d="M 50,60 H 60 l 20,50 Z"
```


## B. 参考

* [Kerf Check Parts Generator](http://doyolab.net/appli/kerf_check/kerf_check.html)
* [PlierCover](https://github.com/ytani01/PliersCover)
