
// shuffle -> 섞는 animation     O
// 카드 원형? 정렬
// 카드 호선 정렬

//플립 모션 -> 수정구슬...? 화면에 보여지고 아래로 펼쳐지는..?


let con = console.log;

class TaroCard {
    #cardHeight;
    constructor() {
        this.field = document.querySelector('.card-wrap');
        this.cardField = document.querySelector('.card-select-wrap');
        this.cardList = [];
        this.MAXCARDS_NUM = 12;
        this.CARD_ROW_GAP = 20;
        this.animation = {};
        this.selectedAreaPosition = {}
        window.addEventListener('resize', () => {
            this.reset();
            // setTimeout(() => {
            //     this.#cardHeight = document.querySelector('.card-select-wrap li img').offsetHeight;
            //     // con(this.#cardHeight)
            //     this.cardField.querySelectorAll('li').forEach((item, idx) => {
            //         item.style.height = this.#cardHeight + 'px';
            //     });
            // }, 200)
        })
    }

    init(cardObj) {
        this.cardCount = cardObj.length;
        cardObj.map(item => this.cardList.push({ data: item }));

        this.randomList();
        this.render();

    }

    reset() {
        this.randomList();
        this.render();

        const resetPosition = '-100%'
        //위치 reset
        this.cardList.forEach(item => {
            item.dom.style.left = resetPosition;
        });
    }

    render() {
        this.cardField.innerHTML = '';
        const cardUl = document.createElement('ul');
        this.cardField.appendChild(cardUl);
        this.cardList.forEach((item, idx) => {
            const cardLi = document.createElement('li');
            cardLi.classList.add('unClick');

            cardLi.setAttribute('data-id', '');
            cardLi.setAttribute('data-id', item.data.id);

            this.cardList[idx].dom = cardLi;

            //----------------------   임시 ------------------------------------
            // cardLi.innerHTML = `<img src="${item.data.imgUrl}" alt="">`;
            cardLi.innerHTML = `<img class="front" src="/cover.png" alt="">`;

            cardUl.appendChild(cardLi);


            //clickEvent 추가
            cardLi.addEventListener('click', (e) => {
                // con(e.target.closest('li').classList)
                if (!e.target.closest('ul').classList.contains('clickable')) {
                    return;
                }
                if (!e.target.closest('li').classList.contains('unClick')) {
                    return;
                }
                if (this.animation.click && this.animation.click.playState == 'running') {
                    return;
                }
                this.#clickAnimation(e);


                //animation끝난후 clickable class추가로 수정 -> 아래코드 주석
                // if (this.#checkRunningAnimation().length == 0) {
                //     this.#clickAnimation(e);
                //     return;
                // }
                // this.#checkRunningAnimation().onfinish = () => {
                //     this.#clickAnimation(e);
                // }
            });
        });


        var img = new Image();
        img.onload = () => {
            //img높이값
            this.#cardHeight = document.querySelector('.card-select-wrap li img').offsetHeight;
            //li높이값 수동으로지정 -> 안의 img가 position:absolute이기때문에
            this.cardField.querySelectorAll('li').forEach((item, idx) => {
                item.style.height = this.#cardHeight + 'px';
            });

            //카드펼쳐지는 영역 position top
            this.selectedAreaPosition.top = this.#cardHeight * 2 + this.CARD_ROW_GAP;
            this.selectedAreaPosition.innerHeight = this.field.clientHeight -
                (parseInt(window.getComputedStyle(this.field).paddingTop) +
                    parseInt(window.getComputedStyle(this.field).paddingBottom));
            this.selectedAreaPosition.bottom = this.selectedAreaPosition.innerHeight -
                this.#cardHeight;

            this.selectedAreaPosition.verticleCenter = this.selectedAreaPosition.top +
                ((this.selectedAreaPosition.innerHeight -
                    this.selectedAreaPosition.top) / 2)

            this.spread();
        };
        img.src = '/cover.png';



    }

    /**
     * 현재생성돼있는 dom 요소의 데이터를 this.cardList에 업데이트
     */
    updateList() {
        this.cardField.querySelectorAll('li').forEach((item, idx) => {
            item.setAttribute('data-id', '');
            item.setAttribute('data-id', this.cardList[idx].data.id);
            this.cardList[idx].dom = item;
            item.querySelector('img').src = this.cardList[idx].data.imgUrl;

            //----------------------   임시 ------------------------------------
            // item.querySelector('img').src = this.cardList[idx].data.imgUrl;
            item.querySelector('img').src = '/cover.png';
        });
    }

    randomList() {
        this.cardList.sort(() => Math.random() - 0.5);
        this.topCardList = Array.from(this.cardList).slice(0, this.MAXCARDS_NUM);
        this.bottomCardList = Array.from(this.cardList).slice(this.MAXCARDS_NUM);
    }

    spread() {
        this.#stopAnimation();

        //카드 펼치기
        const topTimeForAnimation = 700;
        this.topCardList.forEach((item, idx) => {
            const delay = topTimeForAnimation / this.topCardList.length * idx;

            item.dom.animate([
                { left: this.#calculateLeftPosition(this.topCardList, idx) }],
                { duration: topTimeForAnimation, fill: "forwards", delay });
        });

        this.bottomCardList.forEach((item, idx) => {
            //top
            const topVw = this.#calculateVw(this.#cardHeight + this.CARD_ROW_GAP);
            item.dom.style.top = topVw + 'vw';

            //left
            const delay = topTimeForAnimation + (topTimeForAnimation / this.bottomCardList.length * idx);

            this.animation.spread = item.dom.animate([{ left: this.#calculateLeftPosition(this.bottomCardList, idx) },],
                { duration: topTimeForAnimation, fill: "forwards", delay });

        });

        if (!this.animation.spread) return;
        this.animation.spread.onfinish = () => {
            // class추가
            this.cardField.querySelector('ul').classList.add('clickable');
        }
    }

    /**
     * 카드를 섞음 -> rerender하지 않고 cardList를 update 함 
     */
    shuffle() {
        //class삭제
        this.cardField.querySelector('ul').classList.remove('clickable');


        //카드 뽑힌게 있으면 -> 
        //카드 뽑는중이면
        if (this.animation.click && this.animation.click.some(item => item.playState == 'running')) {
            console.log(this.animation.click)
            this.#stopAnimation();
            // this.animation.click[this.animation.click.length - 1].onfinish = () => {
            this.resetFlip();
            this.animation.flipBack.onfinish = () => {
                this.cardField.querySelectorAll('li img.back').forEach(item => {
                    item.remove();
                });
                this.playShuffleAnimation();
            }
            // }

        } else {
            this.playShuffleAnimation();
        }
    }

    playShuffleAnimation() {
        this.#stopAnimation('spread', 'shuffle');

        if (this.animation.spread.playState != 'finished') {
            this.animation.spread.onfinish = () => {
                this.animateshuffle();
            }

        } else {
            this.animateshuffle();
        }
    }

    animateshuffle() {
        this.randomList();
        this.updateList();

        //shffle -> 애니메이션 멈춤..
        this.#stopAnimation();

        const top = this.#calculateVw(this.#cardHeight + this.CARD_ROW_GAP) / 2;
        const topTimeForAnimation = 1300;

        this.topCardList.forEach((item, idx) => {
            //가운데 위치
            item.dom.animate([{ top: top + 'vw', left: '50%', transform: 'translateX(-50%)' },],
                { duration: 200, fill: "forwards" });

            //섞는 motion
            const delay = topTimeForAnimation / this.topCardList.length * idx;

            item.dom.animate([
                { left: '50%', },
                { left: '35%' },
                { left: '50%', zIndex: this.topCardList.length + idx }
            ],
                { duration: topTimeForAnimation, delay: delay, fill: "forwards" });
        });

        this.bottomCardList.forEach((item, idx) => {
            //가운데 위치
            item.dom.animate([{ top: top + 'vw', left: '50%', transform: 'translateX(-50%)' },],
                { duration: 200, fill: "forwards" });

            //섞는 motion
            const delay = topTimeForAnimation / this.bottomCardList.length * idx;

            this.animation.shuffle = item.dom.animate([
                { left: '50%' },
                { left: '65%' },
                { left: '50%', zIndex: this.bottomCardList.length + idx }
            ],
                { duration: topTimeForAnimation, delay: delay, fill: "forwards" });
        });



        //카드 펼치기
        //애니메이션 중일때만.. 체크됨 
        this.animation.shuffle.onfinish = () => {
            // console.log(' shuffle 애니메이션 끝');

            //위치 변경(0)
            this.cardList.forEach((item, idx) => {
                item.dom.style.zIndex = 0;
                item.dom.animate([{ top: 0, left: 0, transform: 'translateX(0)' }],
                    { duration: 300, fill: 'forwards' })
            });

            const topTimeForAnimation = 500;
            let rightPosition = 0;
            let topDelay = 0;
            this.topCardList.forEach((item, idx) => {

                let leftPosition = this.#calculateLeftPosition(this.topCardList, idx);
                if (idx == 0) {
                    leftPosition = 0;
                }
                const delay = topTimeForAnimation / this.topCardList.length * idx;
                rightPosition = leftPosition;
                topDelay = topTimeForAnimation / this.topCardList.length * (idx - 2);

                item.dom.animate([
                    { left: leftPosition }],
                    { duration: topTimeForAnimation, fill: "forwards", delay });
            });


            this.bottomCardList.forEach((item, idx) => {
                //top
                const topVw = this.#calculateVw(this.#cardHeight + this.CARD_ROW_GAP) + 'vw';

                //윗줄과 함께 이동
                item.dom.animate([
                    { left: 0, top: 0 }, { left: rightPosition, top: 0 },],
                    { duration: topTimeForAnimation, fill: "forwards", delay: topDelay });
                //아래줄로 이동
                item.dom.animate([
                    { left: rightPosition, top: 0 }, { left: 0, top: topVw },],
                    { duration: 400, fill: "forwards", delay: topDelay + topTimeForAnimation });
                //펼쳐지기
                this.animation.shuffleSpread = item.dom.animate([{ top: topVw, left: this.#calculateLeftPosition(this.bottomCardList, idx) },],
                    { duration: topTimeForAnimation, fill: "forwards", delay: topTimeForAnimation + topDelay + 400 });

            });

            if (!this.animation.shuffleSpread) return;
            this.animation.shuffleSpread.onfinish = () => {
                // class추가
                this.cardField.querySelector('ul').classList.add('clickable');
            }

        }

    }



    #calculateVw(px) {
        return ((px) / window.innerWidth * 100);
    }


    #calculateLeftPosition(cardList, idx) {
        let leftPx = (100 / cardList.length - 1);
        return Math.ceil(leftPx * idx + 1) + '%';
    }


    #stopAnimation(...except) {
        for (let key in this.animation) {

            if (except.some(item => item == key)) {
                continue;
            }
            if (this.animation[key].playState == 'running') {
                this.animation[key].pause();
                // console.log('애니메이션 멈춤')
            }
        }
    }

    #checkRunningAnimation() {
        const result = [];
        for (const key in this.animation) {
            (this.animation[key].playState == 'running') && result.push({ name: key, animation: this.animation[key] });
        }
        return result;
    }

    //animation
    //1. reset -> spread
    //2. shuffle
    //3. shuffle -> spread



    #clickAnimation(e) {
        const target = e.target.parentNode;
        target.classList.replace('unClick', 'clicked');


        //서버이미지 임시------------ 이미지 로딩추가 ....
        const img = new Image();
        img.src = '/cover.png';
        img.onload = () => {

            const back = document.createElement('img');
            const imgUrl = this.cardList.find(item => item.data.id == target.getAttribute('data-id')).data.imgUrl;
            back.classList.add('back');
            back.setAttribute('src', imgUrl);

            //뽑는 motion
            this.animation.click = [];
            const pickMotion01 = e.target.parentNode.animate([
                { transform: 'translateY(-35%)' },
            ],
                { duration: 600, fill: "forwards" });
            const pickMotion02 = e.target.parentNode.animate([
                { opacity: 0 },
            ],
                { duration: 600, delay: 300, fill: "forwards" });
            this.animation.click.push(pickMotion01)
            this.animation.click.push(pickMotion02)

            //뽑히는동안은 다른카드 pick막기
            e.target.closest('ul').classList.remove('clickable');

            //정중앙에서 flip  
            const filpMotion = target.animate([
                { top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0 },
                { top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(2)', opacity: 0 },
                { top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(2)', opacity: 1, zIndex: 9999 },
            ],
                { duration: 1200, delay: 900, fill: "forwards" });
            this.animation.click.push(filpMotion)
            //back 뒷면카드 요소 추가
            filpMotion.onfinish = () => {

                back.style.transform = 'rotateY(180deg)';
                target.appendChild(back);

                //front 뒤집기
                const flipBack01 = target.querySelector('img.front').animate({
                    transform: 'rotateY( 180deg )',
                },
                    { duration: 600, fill: "forwards" });

                const flipBack02 = back.animate({
                    transform: 'rotateY( 0deg )',
                },
                    { duration: 600, fill: "forwards" });
                this.animation.click.push(flipBack01)
                this.animation.click.push(flipBack02)

                //하단영역 중앙정렬
                const selectedCardPositionList = [
                    [{ top: this.selectedAreaPosition.verticleCenter, left: '50%' }],
                    [{ top: this.selectedAreaPosition.verticleCenter, left: '30%' }, { top: this.selectedAreaPosition.verticleCenter, left: '60%' }],
                    [{ top: 0, left: 0 }, { top: 0, left: 0 }, { top: 0, left: 0 }],
                    [{ top: 0, left: 0 }, { top: 0, left: 0 }, { top: 0, left: 0 }, { top: 0, left: 0 }]
                ];
                const positionCenter = target.animate([
                    {
                        top: this.selectedAreaPosition.verticleCenter + 'px',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1
                    },
                ],
                    { duration: 600, delay: 1200, fill: "forwards" });

                this.animation.click.push(positionCenter)

                positionCenter.onfinish = () => {
                    e.target.closest('ul').classList.add('clickable');
                }
            }


        };

    }


    resetFlip() {
        //shuffle -> flip 카드 reset
        //back요소 삭제,
        //front 뒤집기
        //clicked -> unClick
        this.cardField.querySelectorAll('li.clicked').forEach(item => {
            item.classList.replace('clicked', 'unClick');
            // item.querySelector('img.front').style.transform = 'rotateY(0deg )';

            (item.querySelector('img.back'))
            //반대로 뒤집기  front->앞 back->뒤
            item.querySelector('img.front').animate({
                transform: 'rotateY(0deg)',
            },
                { duration: 600, fill: "forwards" });
            this.animation.flipBack = item.querySelector('img.back').animate({
                transform: 'rotateY( 180deg )',
            },
                { duration: 600, fill: "forwards" });

        });

    }


}




