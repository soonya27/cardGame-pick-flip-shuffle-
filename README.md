# CardGame-Shuffle (카드 게임)

## [website link](https://soonya27.github.io/cardGame-pick-flip-shuffle-/)


###

(이 프로젝트는 Card를 섞고, 뽑고, 나열하는 기능을 구현한 javascript 모바일 게임입니다.

vanilla Js와 class를 이용하여 객체 지향적인 코드를 작성했습니다.)


## 🌟Features (주요 기능)

- 카드 초기화
- 카드 나열 (일자정렬, 라인정렬, 원형 정렬)
- 카드 셔플(기존 나열 유지) - data shuffle
- 카드 선택 갯수 지정가능
- 선택 후 flip 애니메이션, 선택 완료후 카드 이동 가능
- 효과음 추가

## 🌟Tech Stack (기술 스택)

- **Frontend:**
  - Javascript

- **Others:**
  - Git (Version control)
  - Prettier (Code formatting and static analysis)

- **Deployment:**
  - githubpage

## 🌟Feedback
I'm always looking to improve! If you have any feedback, suggestions, or bug reports, feel free to open an issue or reach out to me directly.
Thank you for visiting my portfolio website!

( 항상 개선을 위한 피드백, 제안 또는 버그 신고를 환영합니다! 언제든지 문제를 제기하거나 저에게 직접 문의해 주세요.
 제 홈페이지를 방문해 주셔서 감사합니다!)



## 🌟Code block

```javascript
'use strict';
let con = console.log;
const coverIgmUrl = './img/cover.png';
const audioObj = {}
audioObj.clickSound = new Audio('./sounds/crash.mp3');
audioObj.spreadSound = new Audio('./sounds/spread.mp3');
audioObj.filpSound = new Audio('./sounds/sparkle.mp3'); //filpcard.mp3
audioObj.shuffleSound = new Audio('./sounds/shuffle.mp3');
audioObj.positionSound = new Audio('./sounds/shuffleSpread.mp3');




/**
 * TaroCard
 * constructor(cardObj, maxCnt)
 * @param {object[{id,imgUrl,title}...]} cardObj
 * @param {number} maxCnt : 선택가능한 카드  (최대 5)
 * 
 * method
 * - init() : 기본 세팅(일자라인이 기본)
 * - spreadCurve() : 커브 라인 세팅
 * - shuffle() : 카드 섞기  (line | curve 유지)
 * 
 * property
 * - cardCount :number - 전체 카드 수
 * - maxSelectCount :number - 선택가능한 카드 수
 * - cardList :[{data:{id,imgUrl,title}, dom :li }...] - 카드 객체 리스트
 * - selectedList :[{data:{id,imgUrl,title}, dom :li }...] - 선택된 카드 객체 리스트
 */
class TaroCard {
    #MAX_CARDS_IN_ONE_LINE;
    #CARD_ROW_GAP;
    #MAX_SELECET_CNT;
    #field;
    #fieldWidth;
    #fieldHeight;
    #fieldPaddingTop;
    #cardList;
    #cardListTop;
    #cardListBottom;
    #cardCount;
    #cardHeight;
    #cardWidth;
    #selectedAreaPosition;
    #animation;
    #selcetedList;
    #audioTimeout;
    #imgTimeout;
    #init;
    #lineState;
    #carpet;
    #CIRCLE_DOUBLE;
    constructor(cardObj, maxCnt) {
        this.#MAX_CARDS_IN_ONE_LINE = 12; //한줄 최대 카드갯수
        this.#CARD_ROW_GAP = 20; // 카드 세로 간격 px
        this.#CIRCLE_DOUBLE = 0.35;
        if (maxCnt > 5) {
            con('최대 선택가능한 카드는 5개입니다.');
            this.#MAX_SELECET_CNT = 5;
        } else {
            this.#MAX_SELECET_CNT = maxCnt;
        }
        this.#field = document.querySelector('.card-wrap');
        this.#cardList = [];
        this.#selcetedList = [];
        this.#animation = {};
        this.#selectedAreaPosition = {}
        this.#cardCount = cardObj.length;
        cardObj.map(item => this.#cardList.push({ data: item }));
        //반응형
        window.addEventListener('resize', () => {
            // this.#init && this.reset();
            this.#init && this.#measure();
        });


    }

    /**
    * 카드 초기화 : 기본 라인정렬(spread)
    */
    init() {
        this.#init = true;
        this.#lineState = 'line';

        this.#randomList();
        this.#render();
        const resetPosition = '-100%';
        //위치 reset
        this.#cardList.forEach(item => {
            item.dom.style.left = resetPosition;
        });
    }

    /**
    * 커브 라인정렬 
    */
    spreadCurve() {
        this.#lineState = 'curve'
        this.#randomList();
        this.#render();
    }

    /**
       * 커브 라인정렬 
       */
    spreadCircle() {
        this.#lineState = 'circle';
        this.#randomList();
        this.#render();
    }

    /**
    * 카드를 섞음 -> rerender하지 않고 cardList를 update 함 
    * curve,line 상태값 유지한채 shuffle
    */
    shuffle() {
        if (this.#lineState == 'line') {
            this.#lineState = 'shuffleLine';
        }
        //class삭제
        this.#field.querySelector('ul').classList.remove('clickable');
        this.#field.querySelector('ul').classList.remove('finished');

        //클릭여부  -> 클릭된게 있고 클릭 애니메이션 진행중일때
        if (this.selectedList.length != 0) {
            if (this.#animation.click && this.#animation.click.playState == 'running') {
                //stop -> backfilp -> img요소 없애고 다시 셔플진행
                this.#stopAnimation();

                //다시 뒤집기 시행
                this.#resetCardState();

            } else {
                this.#resetCardState();
            }
        } else {
            //spread 또는 shuffle 중이거나 아무것도 아닌상태
            this.#stopAnimation('spread', 'shuffle');
            if (this.#animation.spread.playState != 'finished') {
                this.#animation.spread.onfinish = () => {
                    this.#shuffleAnimation();
                }
            } else {
                this.#shuffleAnimation();
            }
        }
    }

    get cardCount() {
        return this.#cardCount;
    }

    get maxSelectCount() {
        return this.#MAX_SELECET_CNT;
    }

    get cardList() {
        return this.#cardList;
    }

    get selectedList() {
        return this.#selcetedList;
    }

    /**
    * 현재생성돼있는 dom 요소의 데이터를 this.#cardList에 업데이트
    */
    #updateList() {
        this.#field.querySelectorAll('li').forEach((item, idx) => {
            item.setAttribute('data-id', '');
            item.setAttribute('data-id', this.#cardList[idx].data.id);
            this.#cardList[idx].dom = item;
        });
    }

    #randomList() {
        this.#cardList.sort(() => Math.random() - 0.5);
        this.#cardListTop = Array.from(this.#cardList).slice(0, this.#MAX_CARDS_IN_ONE_LINE);
        this.#cardListBottom = Array.from(this.#cardList).slice(this.#MAX_CARDS_IN_ONE_LINE);
        this.#selcetedList = [];
    }

    #render() {
        clearTimeout(this.#imgTimeout);
        this.#field.innerHTML = '';
        const cardUl = document.createElement('ul');
        this.#field.appendChild(cardUl);
        this.#cardList.forEach((item, idx) => {
            const cardLi = document.createElement('li');
            cardLi.classList.add('unClick');
            cardLi.setAttribute('data-id', '');
            cardLi.setAttribute('data-id', item.data.id);
            cardLi.innerHTML = `<img class="front" src="${coverIgmUrl}" alt="">`;
            cardUl.appendChild(cardLi);

            //cardList dom요소 추가
            this.#cardList[idx].dom = cardLi;

            //clickEvent
            cardLi.addEventListener('click', (e) => {
                if (!e.target.closest('ul').classList.contains('clickable')) {
                    return;
                }
                if (!e.target.closest('li').classList.contains('unClick')) {
                    return;
                }
                e.target.parentNode.classList.replace('unClick', 'clicked');
                this.#selcetedList.push(this.#cardList.find(item => item.dom == e.target.parentNode));
                playSound(audioObj.clickSound);
                this.#clickAnimation(e);
            });

            let initX, initY, firstX, firstY;

            cardLi.addEventListener('mousedown', function (e) {
                //위치 벗어나면 return...(돋보기랑 같은 원리로...)
                if (e.target.localName != 'img') {
                    return;
                }
                if (e.target.closest('div').classList.contains('sparkle-img')) {
                    return;
                }
                if (!e.target.closest('ul').classList.contains('finished') ||
                    !e.target.closest('li').classList.contains('clicked')) {
                    return;
                }
                e.preventDefault();
                initX = this.offsetLeft;
                initY = this.offsetTop;
                firstX = e.pageX;
                firstY = e.pageY;
                e.target.closest('li').animate([
                    {
                        left: initX + e.pageX - firstX + 'px',
                        top: initY + e.pageY - firstY + 'px'
                    }],
                    { duration: 100, fill: "forwards" });
                this.addEventListener('mousemove', dragIt, false);

                window.addEventListener('mouseup', function () {
                    cardLi.removeEventListener('mousemove', dragIt, false);
                }, false);

            }, false);


            cardLi.addEventListener('touchstart', function (e) {
                if (e.target.localName != 'img') {
                    return;
                }
                if (e.target.closest('div').classList.contains('sparkle-img')) {
                    return;
                }
                if (!e.target.closest('ul').classList.contains('finished') ||
                    !e.target.closest('li').classList.contains('clicked')) {
                    return;
                }
                e.preventDefault();
                initX = this.offsetLeft;
                initY = this.offsetTop;
                var touch = e.touches;
                firstX = touch[0].pageX;
                firstY = touch[0].pageY;

                this.addEventListener('touchmove', swipeIt, { passive: false });

                window.addEventListener('touchend', function (e) {
                    e.preventDefault();
                    cardLi.removeEventListener('touchmove', swipeIt);
                }, { once: true });

            }, false);

            function dragIt(e) {
                // con('drag')
                this.animate([
                    {
                        left: initX + e.pageX - firstX + 'px',
                        top: initY + e.pageY - firstY + 'px'
                    }],
                    { duration: 100, fill: "forwards" });
            }

            function swipeIt(e) {
                // con('swipe')
                var contact = e.touches;
                this.animate([
                    {
                        left: initX + contact[0].pageX - firstX + 'px',
                        top: initY + contact[0].pageY - firstY + 'px'
                    }],
                    { duration: 100, fill: "forwards" });
            }
        });


        //카페트 요소
        this.#carpet = document.createElement('div');
        this.#carpet.setAttribute('class', 'carpet-wrap');
        this.#field.appendChild(this.#carpet);

        const coverImg = new Image();
        coverImg.src = coverIgmUrl;
        coverImg.onload = () => {
            this.#measure();
            this.#lineStateAnimation();
        };
    }

    #lineStateAnimation() {
        switch (this.#lineState) {
            case 'shuffleLine':
                this.#spreadLineAnimation();
                break;
            case 'curve':
                this.#spreadCurveAnimation();
                break;
            case 'circle':
                this.#spreadCircleAnimation();
                break;
            default:
                this.#spread();
                break;
        }
    }

    #measure() {
        //img높이값
        this.#cardHeight = this.#field.querySelector('li img').offsetHeight;
        this.#cardWidth = this.#field.querySelector('li img').offsetWidth;

        this.#fieldWidth = this.#field.clientWidth -
            (parseInt(window.getComputedStyle(this.#field).paddingLeft) +
                parseInt(window.getComputedStyle(this.#field).paddingRight));

        //li높이값 수동으로지정 -> 안의 img가 position:absolute이기때문에
        this.#field.querySelectorAll('li').forEach((item, idx) => {
            item.style.height = this.#cardHeight + 'px';
        });

        //카드펼쳐지는 영역 position
        //unClick 카드 중 가장 하위 요소 위치값
        const cardlowestPosition = Math.max(...this.#cardList.map(item => {
            if (!item.dom.classList.contains('unClick')) {
                return 0;
            }
            return item.dom.getBoundingClientRect().bottom;
        }));
        const borderTop = parseInt(window.getComputedStyle(document.querySelector('#canvasContainer')).borderTopWidth);
        const borderBottom = parseInt(window.getComputedStyle(document.querySelector('#canvasContainer')).borderBottomWidth);

        this.#selectedAreaPosition.top = cardlowestPosition + this.#CARD_ROW_GAP - borderTop;
        this.#fieldHeight = this.#field.clientHeight -
            (parseInt(window.getComputedStyle(this.#field).paddingTop) +
                parseInt(window.getComputedStyle(this.#field).paddingBottom));
        this.#selectedAreaPosition.height = (this.#fieldHeight - this.#selectedAreaPosition.top + this.#CARD_ROW_GAP + borderTop + borderBottom);

        this.#selectedAreaPosition.verticalCenter = this.#selectedAreaPosition.top + this.#selectedAreaPosition.height / 2 - this.#cardHeight / 2;

        this.#fieldPaddingTop = parseInt(window.getComputedStyle(this.#field).paddingTop);


        const radius = this.#fieldWidth * this.#CIRCLE_DOUBLE;
        const carpetObj = {
            line: {
                top: this.#cardHeight * 2 + this.#CARD_ROW_GAP * 2 + this.#fieldPaddingTop,
                height: this.#fieldHeight - (this.#cardHeight * 2 + this.#CARD_ROW_GAP * 2)
            },
            curve: {
                top: this.#cardHeight * 2 + this.#cardHeight / 4 + this.#CARD_ROW_GAP * 1.5 * 2 + this.#fieldPaddingTop,
                height: this.#fieldHeight - (this.#cardHeight * 2 + this.#cardHeight / 4 + this.#CARD_ROW_GAP * 1.5 * 2)
            },
            circle: {
                top: radius * 2 + this.#cardHeight + this.#fieldPaddingTop + this.#CARD_ROW_GAP,
                height: this.#fieldHeight - (radius * 2 + this.#cardHeight + this.#CARD_ROW_GAP)
            }
        }

        const carpetPositionObj = carpetObj[this.#lineState] || carpetObj['line'];
        this.#carpet.style.width = this.#fieldWidth + 'px';
        for (let key in carpetObj) {
            this.#carpet.style.top = carpetPositionObj.top + 'px';
            this.#carpet.style.height = carpetPositionObj.height + 'px';
        }
    }


    /**
     * 카드 펼쳐지기 -> ( defaul line spread )
     */
    #spread() {
        this.#stopAnimation();
        this.#stopSounds();

        //spread sound
        const soundDelay = 600;
        this.#audioTimeout = setTimeout(() => {
            audioObj.spreadSound.volume = 1;
            playSound(audioObj.spreadSound);
        }, soundDelay);
        this.#audioTimeout = setTimeout(() => {
            this.#stopSounds();
            playSound(audioObj.spreadSound);
        }, soundDelay * 2);

        //카드 펼치기
        const topTimeForAnimation = 700; // 700
        this.#cardListTop.forEach((item, idx) => {
            const delay = topTimeForAnimation / this.#cardListTop.length * idx;

            item.dom.animate([
                { left: this.#calculateLeftPosition(this.#cardListTop, idx) }],
                { duration: topTimeForAnimation, fill: "forwards", delay });
        });

        this.#cardListBottom.forEach((item, idx) => {
            //top
            const topVw = this.#calculateVw(this.#cardHeight + this.#CARD_ROW_GAP);
            item.dom.style.top = topVw + 'vw';

            //left
            const delay = topTimeForAnimation + (topTimeForAnimation / this.#cardListBottom.length * idx);

            this.#animation.spread = item.dom.animate([{ left: this.#calculateLeftPosition(this.#cardListBottom, idx) },],
                { duration: topTimeForAnimation, fill: "forwards", delay });
        });

        if (!this.#animation.spread) return;
        this.#animation.spread.onfinish = () => {
            // class추가
            this.#field.querySelector('ul').classList.add('clickable');

            this.#measure();
        }
    }

    #shuffleAnimation() {
        this.#randomList();
        this.#updateList();

        //shffle -> 애니메이션 멈춤..
        this.#stopAnimation();
        this.#stopSounds();

        //shuffleSound
        this.#audioTimeout = setTimeout(() => {
            this.#stopSounds();
            audioObj.shuffleSound.volume = 1;
            playSound(audioObj.shuffleSound);
        }, 100);

        const top = this.#calculateVw(this.#cardHeight + this.#CARD_ROW_GAP) / 2;
        const topTimeForAnimation = 1300; //1300
        this.#cardListTop.forEach((item, idx) => {
            //가운데 위치
            item.dom.animate([{ top: top + 'vw', left: '50%', transform: 'translateX(-50%)' },],
                { duration: topTimeForAnimation / this.#cardListTop.length, fill: "forwards" });

            //zIndex 초기화( 정중앙 flip이후의 zindex 되돌리기)
            item.dom.animate({
                zIndex: 0
            },
                { duration: 100, fill: "forwards" });

            //섞는 motion
            const delay = topTimeForAnimation / this.#cardListTop.length * idx;
            item.dom.animate([
                { left: '50%' },
                { left: '35%' },
                { left: '50%' }
            ],
                { duration: topTimeForAnimation, delay: delay, fill: "forwards" });
            item.dom.animate([
                { left: '50%', zIndex: 0 },
                { left: '35%', zIndex: 0 },
                { left: '50%', zIndex: this.#cardListTop.length + idx }
            ],
                { duration: topTimeForAnimation, delay: delay, fill: "backwards" });
        });

        this.#cardListBottom.forEach((item, idx) => {
            //가운데 위치
            item.dom.animate([{ top: top + 'vw', left: '50%', transform: 'translateX(-50%)' },],
                { duration: topTimeForAnimation / this.#cardListBottom.length, fill: "forwards" });

            //zIndex 초기화( 정중앙 flip이후의 zindex 되돌리기)
            item.dom.animate({
                zIndex: 0
            },
                { duration: 100, fill: "forwards" });

            //섞는 motion
            const delay = topTimeForAnimation / this.#cardListBottom.length * idx;
            this.#animation.shuffle = item.dom.animate([
                { left: '50%' },
                { left: '65%' },
                { left: '50%' }
            ],
                { duration: topTimeForAnimation, delay: delay, fill: "forwards" });
            this.#animation.shuffle = item.dom.animate([
                { left: '50%', zIndex: 0 },
                { left: '65%', zIndex: 0 },
                { left: '50%', zIndex: this.#cardListBottom.length + idx }
            ],
                { duration: topTimeForAnimation, delay: delay, fill: "backwards" });
        });


        //카드 펼치기
        this.#animation.shuffle.onfinish = () => {
            this.#lineStateAnimation();
        }
    }

    #spreadLineAnimation() {
        //위치 변경(0)
        this.#cardList.forEach((item, idx) => {
            // item.dom.style.zIndex = 0;
            item.dom.animate([{ top: 0, left: 0, transform: 'translateX(0)' }],
                { duration: 300, fill: 'forwards' })
        });
        //spread sound
        this.#stopSounds();
        this.#audioTimeout = setTimeout(function () {
            audioObj.spreadSound.volume = 0.6;
            playSound(audioObj.spreadSound);
        }, 300);
        this.#audioTimeout = setTimeout(function () {
            playSound(audioObj.spreadSound);
        }, 1300);

        const topTimeForAnimation = 500; //500
        let leftPosition = 0;
        let topDelay = 0;
        this.#cardListTop.forEach((item, idx) => {

            const delay = topTimeForAnimation / this.#cardListTop.length * idx;
            leftPosition = this.#calculateLeftPosition(this.#cardListTop, idx);
            topDelay = topTimeForAnimation / this.#cardListTop.length * (idx - 2);

            item.dom.animate([
                { left: this.#calculateLeftPosition(this.#cardListTop, idx) }],
                { duration: topTimeForAnimation, fill: "forwards", delay });
        });

        this.#cardListBottom.forEach((item, idx) => {
            //top
            const topVw = this.#calculateVw(this.#cardHeight + this.#CARD_ROW_GAP) + 'vw';
            const lastSpreadDelay = 400;
            //윗줄과 함께 이동
            item.dom.animate([
                { left: 0, top: 0 }, { left: leftPosition, top: 0 },],
                { duration: topTimeForAnimation, fill: "forwards", delay: topDelay });
            //아래줄로 이동
            item.dom.animate([
                { left: leftPosition, top: 0 }, { left: 0, top: topVw },],
                { duration: lastSpreadDelay, fill: "forwards", delay: topDelay + topTimeForAnimation });
            //펼쳐지기
            this.#animation.shuffleSpread = item.dom.animate([{ top: topVw, left: this.#calculateLeftPosition(this.#cardListBottom, idx) },],
                { duration: topTimeForAnimation, fill: "forwards", delay: topTimeForAnimation + topDelay + lastSpreadDelay });
        });

        if (!this.#animation.shuffleSpread) return;
        this.#animation.shuffleSpread.onfinish = () => {
            //펼쳐진후 클릭가능(class 추가)
            this.#field.querySelector('ul').classList.add('clickable');

            this.#measure();
        }
    }

    #spreadCurveAnimation() {
        this.#stopAnimation();
        const topLinePosition = this.#cardHeight / 4;
        this.#cardList.forEach((item, idx) => {
            item.dom.animate([{ top: this.#calculateVw(topLinePosition) + 'vw', left: 0, transform: 'translateX(0)' }],
                { duration: 300, fill: 'forwards' })
        });

        //spread sound
        this.#stopSounds();
        this.#audioTimeout = setTimeout(function () {
            audioObj.spreadSound.volume = 0.6;
            playSound(audioObj.spreadSound);
        }, 300);
        this.#audioTimeout = setTimeout(function () {
            playSound(audioObj.spreadSound);
        }, 1300);

        const topTimeForAnimation = 500; //500
        let topPostion = 0;
        let topAnimation = [];

        this.#cardListTop.forEach((item, idx) => {
            topPostion = this.#calculateTopPosition(this.#cardListTop, idx, topLinePosition) + 'px';
            topAnimation.push({ top: topPostion, left: this.#calculateLeftPosition(this.#cardListTop, idx) });
            item.dom.animate(topAnimation,
                { duration: topTimeForAnimation, fill: "forwards", delay: 300 });
        });
        let bottomAnimation = [];
        this.#cardListBottom.forEach((item, idx) => {
            //top
            const topVw = this.#cardHeight + this.#CARD_ROW_GAP * 1.5; //top위치
            const lastSpreadDelay = 400;
            //윗줄과 함께 이동
            item.dom.animate(topAnimation,
                { duration: topTimeForAnimation, fill: "forwards", delay: 300 });
            topPostion = this.#calculateVw(this.#calculateTopPosition(this.#cardListBottom, idx, topLinePosition)) +
                this.#calculateVw(topVw) + 'vw';
            //아래줄로 이동
            item.dom.animate([
                { left: 0, top: this.#calculateVw(topLinePosition + topVw) + 'vw' },],
                { duration: lastSpreadDelay, fill: "forwards", delay: topTimeForAnimation + 300 });
            //펼쳐지기
            bottomAnimation.push({ top: topPostion, left: this.#calculateLeftPosition(this.#cardListBottom, idx) });
            this.#animation.spread = item.dom.animate(bottomAnimation,
                { duration: topTimeForAnimation, fill: "forwards", delay: topTimeForAnimation + lastSpreadDelay + 300 });
        });

        if (!this.#animation.spread) return;
        this.#animation.spread.onfinish = () => {
            //펼쳐진후 클릭가능(class 추가)
            this.#field.querySelector('ul').classList.add('clickable');

            this.#measure();
        }
    }



    #spreadCircleAnimation() {
        this.#stopAnimation();

        //spread sound
        this.#stopSounds();

        const radius = this.#fieldWidth * this.#CIRCLE_DOUBLE;
        let theta = [];
        let frags = 360 / this.#cardCount;
        for (let i = 0; i <= this.#cardCount; i++) {
            theta.push((frags / 195) * i * Math.PI);
        }
        let circleArray = [];
        for (let i = 0; i < this.#cardCount; i++) {
            circleArray.push({
                posx: Math.round(radius * (Math.cos(theta[i]))) + 'px',
                posy: Math.round(radius * (Math.sin(theta[i]))) + 'px'
            });
            // }
        }
        const timeForAnimation = 700; //900

        let topList = [];
        this.#cardList.forEach((item, idx) => {

            //시작 위치
            item.dom.animate([{
                top: (radius / 2 + (this.#cardHeight - this.#cardWidth) + this.#fieldPaddingTop + parseInt(circleArray[0].posy)) + 'px',
                left: ((this.#fieldWidth / 2 - this.#cardWidth / 2) - parseInt(circleArray[0].posx)) + 'px',
                transform: 'translateX(0)'
            },],
                { duration: timeForAnimation, fill: "forwards" });

            const topPostion = (radius / 2 + (this.#cardHeight - this.#cardWidth) + this.#fieldPaddingTop + parseInt(circleArray[idx].posy)) + 'px';
            const leftPositon = ((this.#fieldWidth / 2 - this.#cardWidth / 2) - parseInt(circleArray[idx].posx)) + 'px';
            topList.push({ top: topPostion, left: leftPositon });
            const delay = timeForAnimation / this.#cardList.length * idx;
            this.#animation.spread = item.dom.animate(topList,
                { duration: timeForAnimation, fill: "forwards", delay: delay + timeForAnimation });
        });

        if (!this.#animation.spread) return;
        this.#animation.spread.onfinish = () => {
            //펼쳐진후 클릭가능(class 추가)
            this.#field.querySelector('ul').classList.add('clickable');

            this.#measure();
        }
    }


    #clickAnimation(e) {
        const target = e.target.parentNode; //li

        //서버이미지 임시------------ 이미지 로딩추가 ....
        const img = new Image();
        img.src = './img/cover.png';
        img.onload = () => {

            const backImg = document.createElement('img');
            const imgUrl = this.#cardList.find(item => item.data.id == target.getAttribute('data-id')).data.imgUrl;
            backImg.classList.add('back');
            backImg.setAttribute('src', imgUrl);

            //뽑는 motion
            const clickTimeForAnimation = 600; //600
            const clickDelayForAnimation = 300; //300
            this.#animation.click = e.target.parentNode.animate([
                { transform: 'translateY(-35%)' },
            ],
                { duration: clickTimeForAnimation, fill: "forwards" });
            this.#animation.click = e.target.parentNode.animate([
                { opacity: 0 },
            ],
                { duration: clickTimeForAnimation, delay: clickDelayForAnimation, fill: "forwards" });

            //뽑히는동안은 다른카드 pick막기
            e.target.closest('ul').classList.remove('clickable');

            //정중앙 위치
            const flipTimeForAnimation = 1500; //1200
            this.#animation.click = target.animate([
                { top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0 },
                { top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(2)', opacity: 0 },
                { top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(2)', opacity: 1, zIndex: 9999 },
            ],
                { duration: flipTimeForAnimation, delay: clickTimeForAnimation + clickDelayForAnimation, fill: "forwards" });
            //filpSound
            //                     정중앙에서 flip 애니메이션의 delay                +  flip 애니메이션 duration의 2번째 단계에서 sound시작
            const soundDelay = (clickTimeForAnimation + clickDelayForAnimation) + flipTimeForAnimation / 3 * 2;

            this.#audioTimeout = setTimeout(() => {
                playSound(audioObj.filpSound);
            }, soundDelay);
            this.#imgTimeout = setTimeout(() => {
                //sparkle 요소 추가
                const sparkleDiv = document.createElement('div');
                sparkleDiv.classList.add('sparkle-img');
                sparkleDiv.innerHTML = `<img src='./img/sparkle_img_twinkl.svg'>`;
                sparkleDiv.style.width = e.target.clientWidth * 5 + 'px';
                this.#field.appendChild(sparkleDiv);

                const sparkleAnimation = sparkleDiv.animate([
                    { opacity: 0 },
                    { opacity: 1 },
                    { opacity: 1 },
                    { opacity: 0 },
                ],
                    { duration: soundDelay + 200, fill: "backwards" });
                sparkleAnimation.onfinish = () => {
                    sparkleDiv.remove();
                }
            }, soundDelay);


            //back 뒷면카드 요소 추가
            this.#animation.click.onfinish = () => {
                backImg.style.transform = 'rotateY(180deg)';
                target.appendChild(backImg);

                //flip 뒤집기
                const flipTimeForAnimation = 600; //600
                this.#animation.click = target.querySelector('img.front').animate({
                    transform: 'rotateY( 180deg )',
                },
                    { duration: flipTimeForAnimation, fill: "forwards" });
                this.#animation.click = backImg.animate({
                    transform: 'rotateY( 0deg )',
                },
                    { duration: flipTimeForAnimation, fill: "forwards" });

                //하단영역 카드 정렬
                const selectedCardPositionList = [
                    [{ top: this.#selectedAreaPosition.verticalCenter, left: '50%' }],
                    [{ top: this.#selectedAreaPosition.verticalCenter, left: '40%' }, { top: this.#selectedAreaPosition.verticalCenter, left: '60%' }],
                    [{ top: this.#selectedAreaPosition.verticalCenter, left: '30%' }, { top: this.#selectedAreaPosition.verticalCenter, left: '50%' }, { top: this.#selectedAreaPosition.verticalCenter, left: '70%' }],
                    [{ top: this.#selectedAreaPosition.verticalCenter, left: '20%' }, { top: this.#selectedAreaPosition.verticalCenter, left: '40%' }, { top: this.#selectedAreaPosition.verticalCenter, left: '60%' }, { top: this.#selectedAreaPosition.verticalCenter, left: '80%' }],
                    [{ top: this.#selectedAreaPosition.verticalCenter, left: '10%' }, { top: this.#selectedAreaPosition.verticalCenter, left: '30%' }, { top: this.#selectedAreaPosition.verticalCenter, left: '50%' }, { top: this.#selectedAreaPosition.verticalCenter, left: '70%' }, { top: this.#selectedAreaPosition.verticalCenter, left: '90%' }],
                ];
                const position = selectedCardPositionList[this.selectedList.length - 1][selectedCardPositionList[this.selectedList.length - 1].length - 1];


                if (this.selectedList.length > 1) {
                    const length = this.selectedList.length;
                    //이미 내려진 카드 옮기기
                    this.#selcetedList.some((item, idx) => {
                        const position = selectedCardPositionList[length - 1][idx];
                        item.dom.animate([
                            {
                                // top: position.top + 'px',
                                left: position.left,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 1
                            },
                        ],
                            { duration: flipTimeForAnimation, delay: flipTimeForAnimation * 2, fill: "forwards" });
                        //방금 선택된것 제외
                        return idx + 1 == length - 1;
                    })
                }
                this.#animation.click = target.animate([
                    {
                        top: (position.top / this.#fieldHeight * 100) + '%',
                        left: position.left,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1
                    },
                ],
                    { duration: flipTimeForAnimation, delay: flipTimeForAnimation * 2, fill: "forwards" });
                //positionSound
                this.#audioTimeout = setTimeout(() => {
                    this.#stopSounds();
                    audioObj.positionSound.volume = 0.6;
                    playSound(audioObj.positionSound);
                }, flipTimeForAnimation * 2 + flipTimeForAnimation - 200);


                this.#animation.click.onfinish = () => {
                    //모두 선택됐으면 click막기
                    if (this.selectedList.length == this.#MAX_SELECET_CNT) {
                        e.target.closest('ul').classList.add('finished');
                        return;
                    }
                    e.target.closest('ul').classList.add('clickable');
                }
            }
        };
    }

    /**
    * 뒤집어진 카드 reset
    */
    #resetCardState() {
        this.selectedList.forEach((item, idx) => {
            clearTimeout(this.#imgTimeout);
            if (this.#field.querySelector('.sparkle-img')) {
                this.#field.querySelector('.sparkle-img').remove();
            }
            if (item.dom.querySelector('img.back') == null) {
                //style 되돌리기
                item.dom.animate({
                    opacity: 1
                },
                    { duration: 100, fill: "forwards" });
                item.dom.classList.replace('clicked', 'unClick');
                return;
            }

            //반대로 뒤집기  front->앞 back->뒤
            const flipBackTimeForAnimation = 600; //600
            const delay = flipBackTimeForAnimation / this.selectedList.length * idx
            this.#animation.flipBack = item.dom.querySelector('img.front').animate({
                transform: 'rotateY(0deg)',
            },
                { duration: flipBackTimeForAnimation, delay: delay, fill: "both" });

            this.#animation.flipBack = item.dom.querySelector('img.back').animate({
                transform: 'rotateY( 180deg )',
            },
                { duration: flipBackTimeForAnimation, delay: delay, fill: "both" });

            item.dom.classList.replace('clicked', 'unClick');

        });
        if (this.#animation.flipBack && this.#animation.flipBack.playState == 'running') {
            this.#animation.flipBack.onfinish = () => {
                this.#field.querySelectorAll('li img.back').forEach(item => {
                    item.remove();
                });
                this.#shuffleAnimation();
            }
        } else {
            this.#shuffleAnimation();
        }
    }

    #calculateVw(px) {
        return ((px) / window.innerWidth * 100);
    }

    #calculatePercentage(num) {
        return ((num) / this.#fieldWidth * 100) + '%';
    }

    /**
     * spread, curve시 카드 left position
     * @param {*} cardList 
     * @param {*} idx 
     * @returns {string}  px
     */
    #calculateLeftPosition(cardList, idx) {
        let leftPx = ((this.#fieldWidth - this.#cardWidth) / (cardList.length - 1));
        return this.#calculatePercentage(Math.ceil(leftPx * idx));
    }

    /**
    * spreadCurveAnimation시 카드 top position
    * @param {*} cardList 
    * @param {*} idx 
    * @param {*} startTop 시작top값
    * @returns {string} 
    */
    #calculateTopPosition(cardList, idx, startTop) {
        let half = cardList.length / 2
        let firstHalf = Math.ceil(half) - 1;
        let lastHalf = Math.floor(half) - 1;
        // con(half)
        const decrease = startTop - (startTop / firstHalf * idx); // 15 7.5 0
        const increase = (startTop / lastHalf * (idx - lastHalf - 1)); //0  7.5 15
        if (idx < half) {
            return decrease;
        } else if ((firstHalf == lastHalf) && (idx == Math.floor(half))) {
            return 0;
        } else {
            return increase;
        }
    }

    #stopAnimation(...except) {
        for (let key in this.#animation) {
            if (except.some(item => item == key)) {
                continue;
            }
            if (this.#animation[key]?.playState == 'running') {
                this.#animation[key].pause();
            }
        }
    }

    #stopSounds() {
        for (let key in audioObj) {
            stopSound(audioObj[key]);
            //setTimeout걸어둔 audio clear
            clearTimeout(this.#audioTimeout);
        }
    }

    #checkRunningAnimation() {
        const result = [];
        for (const key in this.#animation) {
            if (this.#animation[key].playState == 'finished') {
                result.push({ name: key, animation: this.#animation[key] });
            }
        }
        return result;
    }

}


function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}
function stopSound(sound) {
    sound.pause();
}






```
