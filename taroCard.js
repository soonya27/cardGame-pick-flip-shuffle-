'use strict';
let con = console.log;
const coverIgmUrl = './img/cover.png';
const audioObj = {}
audioObj.clickSound = new Audio('./sounds/crash.mp3');
audioObj.spreadSound = new Audio('./sounds/spread.mp3');
audioObj.filpSound = new Audio('./sounds/flipcard.mp3');
audioObj.shuffleSound = new Audio('./sounds/shuffle.mp3');


//     수정중 *** 검색


/**
 * TaroCard
 * constructor(cardObj, maxCnt)
 * @param {object[{id,imgUrl,title}...]} cardObj
 * @param {number} maxCnt : 선택가능한 카드  (최대 5)
 * 
 * method
 * - init() : 기본 세팅
 * - reset() : 카드 리셋(라인이 기본)
 * - shuffle() : 카드 섞기
 * 
 * property
 * - cardCount {number} : 전체 카드 수
 * - maxSelectCount {number} : 선택가능한 카드 수
 * - cardList {Array[{data:{id,imgUrl,title}, dom :li }...]} : 카드 객체 리스트
 * - selectedList {Array [{data:{id,imgUrl,title}, dom :li }...]} : 선택된 카드 객체 리스트
 */
class TaroCard {
    #MAX_CARDS_IN_ONE_LINE;
    #CARD_ROW_GAP;
    #MAX_SELECET_CNT;
    #field;
    #fieldWidth;
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
    constructor(cardObj, maxCnt) {
        this.#MAX_CARDS_IN_ONE_LINE = 12; //한줄 최대 카드갯수
        this.#CARD_ROW_GAP = 20; // 카드 세로 간격 px
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
        window.addEventListener('resize', () => {
            this.reset();
        });
    }

    init() {
        this.#randomList();
        this.#render();
    }

    /**
     * 카드 초기화 : 기본 라인정렬(spread)
     */
    reset() {
        this.#randomList();
        this.#render();

        const resetPosition = '-100%';
        //위치 reset
        this.#cardList.forEach(item => {
            item.dom.style.left = resetPosition;
        });
    }

    /**
    * 카드를 섞음 -> rerender하지 않고 cardList를 update 함 
    */
    shuffle() {
        //class삭제
        this.#field.querySelector('ul').classList.remove('clickable');

        //shuffle, spread, click중일수있음
        //click중이거나 클릭된게 있을때
        if (this.#animation?.click?.playState == 'running' ||
            this.#field.querySelectorAll('li.clicked').length != 0) {
            this.#stopAnimation();
            this.#stopSounds();
            this.#resetCardState();
            if (this.#animation.flipBack && this.#animation.flipBack.playState == 'running') {
                this.#animation.flipBack.onfinish = () => {
                    this.#field.querySelectorAll('li img.back').forEach(item => {
                        item.remove();
                    });
                    this.#playShuffleAnimation();
                }
            } else {
                //플립백은 있지만 끝났을때
                this.#playShuffleAnimation();
            }
        } else {
            this.#resetCardState();
            this.#playShuffleAnimation();
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

    #render() {
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

            //clickEvent 새로 render될때만 최초 1번
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
        });


        const coverImg = new Image();
        coverImg.src = coverIgmUrl;
        coverImg.onload = () => {
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
            this.#selectedAreaPosition.top = this.#cardHeight * 2 + this.#CARD_ROW_GAP;
            this.#selectedAreaPosition.innerHeight = this.#field.clientHeight -
                (parseInt(window.getComputedStyle(this.#field).paddingTop) +
                    parseInt(window.getComputedStyle(this.#field).paddingBottom));
            this.#selectedAreaPosition.bottom = this.#selectedAreaPosition.innerHeight -
                this.#cardHeight;
            this.#selectedAreaPosition.verticleCenter = this.#selectedAreaPosition.top +
                ((this.#selectedAreaPosition.innerHeight -
                    this.#selectedAreaPosition.top) / 2);

            //------------------ *** 카드 펼쳐질 영역 ui  bgimg 위치 css ...... ------------------------------//
            //(this.#selectedAreaPosition)카드 펼쳐질 영역 ui
            // this.#field.style.background = `url(/card01.png) no-repeat 50% ${this.#selectedAreaPosition.top}px`;
            // this.#field.style.backgroundSize = `cover`;

            this.#spread();
        };
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

    /**
     * 카드 펼쳐지기 -> ( reset )
     */
    #spread() {
        this.#stopAnimation();
        this.#stopSounds();

        //spread sound
        this.#audioTimeout = setTimeout(function () {
            playSound(audioObj.spreadSound);
        }, 500);
        this.#audioTimeout = setTimeout(function () {
            playSound(audioObj.spreadSound);
        }, 1300);

        //카드 펼치기
        const topTimeForAnimation = 700;
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
        }
    }

    #playShuffleAnimation() {
        this.#stopAnimation('spread', 'shuffle');
        if (this.#animation.spread.playState != 'finished') {
            this.#animation.spread.onfinish = () => {
                this.#animateshuffle();
            }

        } else {
            this.#animateshuffle();
        }
    }

    #animateshuffle() {
        this.#randomList();
        this.#updateList();

        //shffle -> 애니메이션 멈춤..
        this.#stopAnimation();
        this.#stopSounds();
        this.#audioTimeout = setTimeout(function () {
            playSound(audioObj.shuffleSound);
        }, 100);

        const top = this.#calculateVw(this.#cardHeight + this.#CARD_ROW_GAP) / 2;
        const topTimeForAnimation = 1300;
        this.#cardListTop.forEach((item, idx) => {
            //가운데 위치
            item.dom.animate([{ top: top + 'vw', left: '50%', transform: 'translateX(-50%)' },],
                { duration: 200, fill: "forwards" });

            //섞는 motion
            const delay = topTimeForAnimation / this.#cardListTop.length * idx;

            item.dom.animate([
                { left: '50%' },
                { left: '35%' },
                { left: '50%', zIndex: this.#cardListTop.length + idx }
            ],
                { duration: topTimeForAnimation, delay: delay, fill: "forwards" });
        });

        this.#cardListBottom.forEach((item, idx) => {
            //가운데 위치
            item.dom.animate([{ top: top + 'vw', left: '50%', transform: 'translateX(-50%)' },],
                { duration: 200, fill: "forwards" });

            //섞는 motion
            const delay = topTimeForAnimation / this.#cardListBottom.length * idx;

            //------------------ *** zindex  ...... ------------------------------//
            this.#animation.shuffle = item.dom.animate([
                { left: '50%' },
                { left: '65%' },
                { left: '50%', zIndex: this.#cardListBottom.length + idx }
            ],
                { duration: topTimeForAnimation, delay: delay, fill: "forwards" });
        });


        //카드 펼치기
        this.#animation.shuffle.onfinish = () => {
            //위치 변경(0)
            this.#cardList.forEach((item, idx) => {
                // item.dom.style.zIndex = 0;
                item.dom.animate([{ top: 0, left: 0, transform: 'translateX(0)' }],
                    { duration: 300, fill: 'forwards' })
            });
            //spread sound
            this.#stopSounds();
            this.#audioTimeout = setTimeout(function () {
                playSound(audioObj.spreadSound);
            }, 300);
            this.#audioTimeout = setTimeout(function () {
                playSound(audioObj.spreadSound);
            }, 1300);

            const topTimeForAnimation = 500;
            let rightPosition = 0;
            let topDelay = 0;
            this.#cardListTop.forEach((item, idx) => {

                const delay = topTimeForAnimation / this.#cardListTop.length * idx;
                rightPosition = this.#calculateLeftPosition(this.#cardListTop, idx);
                topDelay = topTimeForAnimation / this.#cardListTop.length * (idx - 2);

                item.dom.animate([
                    { left: this.#calculateLeftPosition(this.#cardListTop, idx) }],
                    { duration: topTimeForAnimation, fill: "forwards", delay });
            });


            this.#cardListBottom.forEach((item, idx) => {
                //top
                const topVw = this.#calculateVw(this.#cardHeight + this.#CARD_ROW_GAP) + 'vw';

                //윗줄과 함께 이동
                item.dom.animate([
                    { left: 0, top: 0 }, { left: rightPosition, top: 0 },],
                    { duration: topTimeForAnimation, fill: "forwards", delay: topDelay });
                //아래줄로 이동
                item.dom.animate([
                    { left: rightPosition, top: 0 }, { left: 0, top: topVw },],
                    { duration: 400, fill: "forwards", delay: topDelay + topTimeForAnimation });
                //펼쳐지기
                this.#animation.shuffleSpread = item.dom.animate([{ top: topVw, left: this.#calculateLeftPosition(this.#cardListBottom, idx) },],
                    { duration: topTimeForAnimation, fill: "forwards", delay: topTimeForAnimation + topDelay + 400 });

            });

            if (!this.#animation.shuffleSpread) return;
            this.#animation.shuffleSpread.onfinish = () => {
                //펼쳐진후 클릭가능(class 추가)
                this.#field.querySelector('ul').classList.add('clickable');
            }
        }
    }

    #calculateVw(px) {
        return ((px) / window.innerWidth * 100);
    }

    /**
     * spread시 카드 left position
     * @param {*} cardList 
     * @param {*} idx 
     * @returns {string} 
     */
    #calculateLeftPosition(cardList, idx) {
        let leftPx = ((this.#fieldWidth - this.#cardWidth) / (cardList.length - 1));
        return Math.ceil(leftPx * idx) + 'px';
    }

    #stopAnimation(...except) {
        for (let key in this.#animation) {
            if (except.some(item => item == key)) {
                continue;
            }
            if (this.#animation[key].playState == 'running') {
                this.#animation[key].pause();
                // console.log('애니메이션 멈춤')
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
            (this.#animation[key].playState == 'running') && result.push({ name: key, animation: this.#animation[key] });
        }
        return result;
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
            this.#animation.click = e.target.parentNode.animate([
                { transform: 'translateY(-35%)' },
            ],
                { duration: 600, fill: "forwards" });
            this.#animation.click = e.target.parentNode.animate([
                { opacity: 0 },
            ],
                { duration: 600, delay: 300, fill: "forwards" });

            //뽑히는동안은 다른카드 pick막기
            e.target.closest('ul').classList.remove('clickable');

            //정중앙에서 flip 
            //filpSound
            this.#audioTimeout = setTimeout(function () {
                playSound(audioObj.filpSound);
            }, 1700);
            this.#animation.click = target.animate([
                { top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0 },
                { top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(2)', opacity: 0 },
                { top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(2)', opacity: 1, zIndex: 9999 },
            ],
                { duration: 1200, delay: 900, fill: "forwards" });

            //back 뒷면카드 요소 추가
            this.#animation.click.onfinish = () => {

                backImg.style.transform = 'rotateY(180deg)';
                target.appendChild(backImg);

                //front 뒤집기
                this.#animation.click = target.querySelector('img.front').animate({
                    transform: 'rotateY( 180deg )',
                },
                    { duration: 600, fill: "forwards" });

                this.#animation.click = backImg.animate({
                    transform: 'rotateY( 0deg )',
                },
                    { duration: 600, fill: "forwards" });

                //하단영역 중앙정렬
                const selectedCardPositionList = [
                    [{ top: this.#selectedAreaPosition.verticleCenter, left: '50%' }],
                    [{ top: this.#selectedAreaPosition.verticleCenter, left: '40%' }, { top: this.#selectedAreaPosition.verticleCenter, left: '60%' }],
                    [{ top: this.#selectedAreaPosition.verticleCenter, left: '30%' }, { top: this.#selectedAreaPosition.verticleCenter, left: '50%' }, { top: this.#selectedAreaPosition.verticleCenter, left: '70%' }],
                    [{ top: this.#selectedAreaPosition.verticleCenter, left: '20%' }, { top: this.#selectedAreaPosition.verticleCenter, left: '40%' }, { top: this.#selectedAreaPosition.verticleCenter, left: '60%' }, { top: this.#selectedAreaPosition.verticleCenter, left: '80%' }],
                    [{ top: this.#selectedAreaPosition.verticleCenter, left: '10%' }, { top: this.#selectedAreaPosition.verticleCenter, left: '30%' }, { top: this.#selectedAreaPosition.verticleCenter, left: '50%' }, { top: this.#selectedAreaPosition.verticleCenter, left: '70%' }, { top: this.#selectedAreaPosition.verticleCenter, left: '90%' }],
                ];
                const position = selectedCardPositionList[this.selectedList.length - 1][selectedCardPositionList[this.selectedList.length - 1].length - 1];

                if (this.selectedList.length > 1) {
                    const length = this.selectedList.length;
                    //이미 내려진 카드 옮기기
                    this.#selcetedList.some((item, idx) => {
                        const position = selectedCardPositionList[length - 1][idx];
                        item.dom.animate([
                            {
                                top: position.top + 'px',
                                left: position.left,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 1
                            },
                        ],
                            { duration: 600, delay: 1200, fill: "forwards" });
                        //방금 선택된것 제외
                        return idx + 1 == length - 1;
                    })
                }
                this.#animation.click = target.animate([
                    {
                        top: position.top + 'px',
                        left: position.left,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1
                    },
                ],
                    { duration: 600, delay: 1200, fill: "forwards" });


                this.#animation.click.onfinish = () => {
                    //모두 선택됐으면 click막기
                    if (this.selectedList.length == this.#MAX_SELECET_CNT) {
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
        this.selectedList.forEach(item => {
            //style 되돌리기
            item.dom.animate({
                opacity: 1
            },
                { duration: 1, fill: "forwards" });

            if (item.dom.querySelector('img.back') == null) {
                item.dom.classList.replace('clicked', 'unClick');
                return;
            }
            //------------------ *** 가끔 씹히는듯.... ------------------------------//

            //반대로 뒤집기  front->앞 back->뒤
            item.dom.querySelector('img.front').animate({
                transform: 'rotateY(0deg)',
            },
                { duration: 600, delay: 1, fill: "forwards" });
            this.#animation.flipBack = item.dom.querySelector('img.back').animate({
                transform: 'rotateY( 180deg )',
            },
                { duration: 600, delay: 1, fill: "forwards" });
            item.dom.classList.replace('clicked', 'unClick');
        });
    }


}



function playSound(sound) {
    sound.play();
}
function stopSound(sound) {
    sound.pause();
}




