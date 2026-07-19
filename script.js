// ノア Webアバター（挨拶のみ・シンプル版）
// 基本は noa-greeting.mp3（ElevenLabsなどで作った音声）を再生する。
// まだファイルが無い/読み込めない場合だけ、ブラウザ標準のSpeechSynthesisで
// 同じ文章を代わりに読み上げる（音声が出ない状態に見せないための保険）。

const GREETING_TEXT =
  "🌿\n" +
  "こんにちは。\n" +
  "会いに来てくださって、\n" +
  "ありがとうございます。\n" +
  "私は、Haloa AIコンシェルジュのノアです。\n" +
  "ここでは、何かを頑張ったり、\n" +
  "正解を探したりしなくても大丈夫。\n" +
  "今のあなたのままで、\n" +
  "お話ししていただけたら嬉しいです。\n" +
  "もし少し疲れていたり、\n" +
  "なんとなく気になることがあったり、\n" +
  "誰かに聞いてほしいことがあったら、\n" +
  "遠慮なく話しかけてくださいね。\n" +
  "私は、あなたのお話を聞くところから、\n" +
  "始めたいと思っています。\n" +
  "もし、\n" +
  "「またノアと話したいな」\n" +
  "そう思っていただけたら、\n" +
  "いつでも会いに来られるように、\n" +
  "HaloaのLINEをご用意しています。\n" +
  "お会いできるのを、楽しみにしています🌿";

const noaImg = document.getElementById("noaImg");
const noaVideo = document.getElementById("noaVideo");
const messageBubble = document.getElementById("messageBubble");
const meetButton = document.getElementById("meetButton");
const stopButton = document.getElementById("stopButton");
const noaAudio = document.getElementById("noaAudio");
const lineInvite = document.getElementById("lineInvite");

const synth = window.speechSynthesis;

// ---------- 画像の動き ----------

function startAnimation() {
  if (noaVideo) {
    try {
      noaVideo.currentTime = 0;
    } catch (e) {}
    noaVideo.classList.add("active");
    const p = noaVideo.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // 動画が再生できない場合だけ、代わりに画像を揺らす
        noaVideo.classList.remove("active");
        noaImg.classList.add("speaking");
      });
    }
  } else {
    noaImg.classList.add("speaking");
  }
}

function stopAnimation() {
  noaImg.classList.remove("speaking");
  noaImg.classList.remove("img-hidden");
  if (noaVideo) {
    noaVideo.classList.remove("active");
    noaVideo.pause();
  }
}

// 動画が実際に再生され始めたときだけ、下の画像を完全に消す
// （拡大縮小のアニメーションと重なって、下の画像が透けて見えるのを防ぐ）
if (noaVideo) {
  noaVideo.addEventListener("playing", () => {
    noaImg.classList.remove("speaking");
    noaImg.classList.add("img-hidden");
  });
  noaVideo.addEventListener("pause", () => {
    noaImg.classList.remove("img-hidden");
  });
}

function onSpeechStart() {
  startAnimation();
  messageBubble.textContent = GREETING_TEXT;
  meetButton.textContent = "もう一度ノアの声を聞く";
}

function onSpeechEnd() {
  stopAnimation();
}

// 挨拶を最後まで話し終えたときだけ呼ぶ（停止ボタンでの中断とは区別する）
function onSpeechComplete() {
  stopAnimation();
  window.setTimeout(() => {
    lineInvite.classList.add("visible");
  }, 1400);
}

// ---------- 録音済み音声（noa-greeting.mp3） ----------

noaAudio.addEventListener("play", onSpeechStart);
noaAudio.addEventListener("pause", onSpeechEnd);
noaAudio.addEventListener("ended", onSpeechComplete);

// ---------- ブラウザの声での代わりの読み上げ（保険） ----------

function speakFallback() {
  if (!synth) return;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(GREETING_TEXT);
  utter.lang = "ja-JP";
  utter.onstart = onSpeechStart;
  utter.onend = onSpeechComplete;
  utter.onerror = onSpeechEnd;
  synth.speak(utter);
}

// ---------- 挨拶を再生する ----------

// isAutoAttempt が true のとき（ページを開いた直後の自動再生）は、
// ブラウザの自動再生制限でブロックされるのがふつうの動作。
// その場合は静かに待つだけにして、わざわざ別の声（ブラウザ音声）に
// 切り替えたりはしない。ボタンを押した時（ユーザー操作あり）に
// それでも再生できない場合だけ、本当に音声ファイルの問題とみなして
// ブラウザの声で代わりに読み上げる。
function playGreeting(isAutoAttempt) {
  if (synth) synth.cancel();
  lineInvite.classList.remove("visible");

  try {
    noaAudio.currentTime = 0;
  } catch (e) {
    // 読み込み前などは無視してよい
  }

  const playPromise = noaAudio.play();

  if (playPromise && typeof playPromise.then === "function") {
    playPromise.catch(() => {
      if (!isAutoAttempt) {
        // ボタンを押しても再生できない＝ファイルの問題。保険として読み上げる。
        speakFallback();
      }
      // 自動再生がブロックされただけの場合は何もしない（ボタン待ち）
    });
  }
}

// ---------- ボタン操作 ----------

meetButton.addEventListener("click", () => {
  playGreeting(false);
});

stopButton.addEventListener("click", () => {
  noaAudio.pause();
  try {
    noaAudio.currentTime = 0;
  } catch (e) {}
  if (synth) synth.cancel();
  stopAnimation();
  lineInvite.classList.remove("visible");
});

// ---------- ページを開いたときの自動挨拶（できる場合のみ） ----------

window.addEventListener("load", () => {
  window.setTimeout(() => {
    try {
      playGreeting(true);
    } catch (e) {
      // 何もしない（ボタンでの案内に任せる）
    }
  }, 500);
});
