// ノア Webアバター（挨拶のみ・シンプル版）
// 基本は noa-greeting.mp3（ElevenLabsなどで作った音声）を再生する。
// まだファイルが無い/読み込めない場合だけ、ブラウザ標準のSpeechSynthesisで
// 同じ文章を代わりに読み上げる（音声が出ない状態に見せないための保険）。

const GREETING_TEXT =
  "はじめまして。\n" +
  "Haloaコンシェルジュのノアです。\n" +
  "会いに来てくださって、ありがとうございます。\n" +
  "私は、あなたを評価したり、足りないところを探したりするためにいるのではありません。\n" +
  "まずは、あなたのお話を聞くことから始めたいと思っています。\n" +
  "今日は、何か気になっていることはありますか？";

const noaImg = document.getElementById("noaImg");
const messageBubble = document.getElementById("messageBubble");
const meetButton = document.getElementById("meetButton");
const stopButton = document.getElementById("stopButton");
const noaAudio = document.getElementById("noaAudio");

const synth = window.speechSynthesis;

// ---------- 画像の動き ----------

function startAnimation() {
  noaImg.classList.add("speaking");
}

function stopAnimation() {
  noaImg.classList.remove("speaking");
}

function onSpeechStart() {
  startAnimation();
  messageBubble.textContent = GREETING_TEXT;
  meetButton.textContent = "もう一度ノアの声を聞く";
}

function onSpeechEnd() {
  stopAnimation();
}

// ---------- 録音済み音声（noa-greeting.mp3） ----------

noaAudio.addEventListener("play", onSpeechStart);
noaAudio.addEventListener("pause", onSpeechEnd);
noaAudio.addEventListener("ended", onSpeechEnd);

// ---------- ブラウザの声での代わりの読み上げ（保険） ----------

function speakFallback() {
  if (!synth) return;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(GREETING_TEXT);
  utter.lang = "ja-JP";
  utter.onstart = onSpeechStart;
  utter.onend = onSpeechEnd;
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
