/*
1. Render song
2. Scroll top
3. Play / pause / seek
4. CD rotate
5. Next / prev
6. Random
7. Next / Repeat when ended
8. Active song
9. Scroll active song intro view
10. Play song when click 
*/
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currenIndex: 0,
  isPlaying: false,
  isRepeat: false,
  isRandom: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Cuối Cùng Thì",
      singer: "Jack - J97",
      path: "./music/song1.mp3",
      image: "./images/image1.jpg",
    },
    {
      name: "Chuyến Đi Của Năm",
      singer: "SOOBIN - Hoàng Sơn",
      path: "./music/song2.mp3",
      image: "./images/image2.jpg",
    },
    {
      name: "Đế Vương",
      singer: "Minh Vương - M4U",
      path: "./music/song3.mp3",
      image: "./images/image3.jpg",
    },
    {
      name: "Đồng Thoại",
      singer: "Quang Lương",
      path: "./music/song4.mp3",
      image: "./images/image4.jpg",
    },
    {
      name: "Đúng Người Đúng Thời Điểm",
      singer: "Thanh Hưng",
      path: "./music/song5.mp3",
      image: "./images/image5.jpg",
    },
    {
      name: "Ta Đã Thích Nhau",
      singer: "Doãn Hiếu",
      path: "./music/song6.mp3",
      image: "./images/image6.jpg",
    },
    {
      name: "Hoa Hải Đường",
      singer: "Jack - J97",
      path: "./music/song7.mp3",
      image: "./images/image7.jpg",
    },
    {
      name: "Ngôi Sao Cô Đơn",
      singer: "Jack - J97",
      path: "./music/song8.mp3",
      image: "./images/image8.jpg",
    },
    {
      name: "Rồi Nâng Cái Ly",
      singer: "Nal",
      path: "./music/song9.mp3",
      image: "./images/image9.jpg",
    },
    {
      name: "Waiting For You",
      singer: "MONO",
      path: "./music/song10.mp3",
      image: "./images/image10.jpg",
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  // render song
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${
          index === this.currenIndex ? "active" : ""
        }" data-index='${index}'>
            <div class="thumb"
                style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
      `;
    });
    playlist.innerHTML = htmls.join("");
  },

  // định nghĩa ra những thuộc tính cho object
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currenIndex];
      },
    });
  },

  // lắng nghe / xử lý sự kiện (DOM event)
  handleEvent: function () {
    const cdWidth = cd.offsetWidth;
    const _this = this;

    // xử lý phóng to / thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // xử lý khi play / pause
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 giây
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // khi song bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPrecent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPrecent;
      }
    };

    // xử lý khi tua bài hát
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // xử lý khi next bài hát
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // xử lý khi prev bài hát
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // xử lý khi bật / tắt random
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // xử lý khi bật / tắt repeat
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // xử lý next song / repeat khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // lắng nghe hành vi khi click vào playlist
    playlist.onclick = function (e) {
      const clickSong = e.target.closest(".song:not(.active)");
      const clickOption = e.target.closest(".option");

      if (clickSong || clickOption) {
        // xử lý khi click vào song
        if (clickSong) {
          _this.currenIndex = Number(clickSong.dataset.index);
          _this.loadCurrentSong();
          audio.play();
          _this.render();
        }

        // xử lý khi click vào song option
        if (clickOption) {
        }
      }
    };
  },

  // tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  // gán cấu hình từ config vào ứng dụng
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  // next bài hát
  nextSong: function () {
    this.currenIndex++;
    if (this.currenIndex >= this.songs.length) {
      this.currenIndex = 0;
    }
    this.loadCurrentSong();
  },

  // prev bài hát
  prevSong: function () {
    this.currenIndex--;
    if (this.currenIndex < 0) {
      this.currenIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  // random bài hát
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currenIndex);
    this.currenIndex = newIndex;
    this.loadCurrentSong();
  },

  // cuộn view theo bài hát được active
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 200);
  },

  start: function () {
    // gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // định nghĩa ra những thuộc tính cho object
    this.defineProperties();

    // lắng nghe / xử lý sự kiện (DOM event)
    this.handleEvent();

    // tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // render song
    this.render();

    // hiển thị trạng thái ban đầu của button random và repeat
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
