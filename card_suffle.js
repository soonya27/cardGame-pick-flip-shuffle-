
// shuffle -> 섞는 animation     O
// 카드 원형? 정렬
// 카드 호선 정렬

//플립 모션 -> 수정구슬...? 화면에 보여지고 아래로 펼쳐지는..?



class TaroCard {
    constructor() {
        this.cardField = document.querySelector('.card-select-wrap');
        this.cardList = [];
        this.MAXCARDS_NUM = 12;
        this.CARD_ROW_GAP = 20;
    }

    init(cardObj) {
        this.cardCount = cardObj.length;
        cardObj.map(item => this.cardList.push({ data: item }));

        this.randomCard();
        this.renderCard();

        var img = new Image();
        img.onload = () => {
            this.cardHeight = document.querySelector('.card-select-wrap li').offsetHeight;
            this.positionCards();
        };
        img.src = '/cover.png';
    }

    reset() {
        this.randomCard();
        this.renderCard();

        const resetPosition = '-100%'
        //위치 reset
        this.cardList.forEach(item => {
            item.dom.style.left = resetPosition;
        });
        this.positionCards();
    }

    renderCard() {
        this.cardField.innerHTML = '';
        const cardUl = document.createElement('ul');
        this.cardField.appendChild(cardUl);
        this.cardList.forEach((item, idx) => {
            const cardLi = document.createElement('li');

            cardLi.setAttribute('data-id', '');
            cardLi.setAttribute('data-id', item.data.id);

            this.cardList[idx].dom = cardLi;

            //----------------------   임시 ------------------------------------
            // cardLi.innerHTML = `<img src="${item.data.imgUrl}" alt="">`;
            cardLi.innerHTML = `<img src="/cover.png" alt="">`;

            cardUl.appendChild(cardLi);
        });
    }

    updateCardList() {
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

    randomCard() {
        this.cardList.sort(() => Math.random() - 0.5);
        this.topCardList = Array.from(this.cardList).slice(0, this.MAXCARDS_NUM);
        this.bottomCardList = Array.from(this.cardList).slice(this.MAXCARDS_NUM);
    }

    positionCards() {
        //카드 펼치기
        const topTimeForAnimation = 700;
        this.topCardList.forEach((item, idx) => {
            const delay = topTimeForAnimation / this.topCardList.length * idx;

            item.dom.animate([
                { left: this.#calculateLeftPosition(this.topCardList, idx) }],
                { duration: topTimeForAnimation, fill: "forwards", delay });
            //class추가
            item.dom.parentNode.classList.add('clickable');
        });

        this.bottomCardList.forEach((item, idx) => {
            //top
            const topVw = this.#calculateVw(this.cardHeight + this.CARD_ROW_GAP);
            item.dom.style.top = topVw + 'vw';

            //left
            const delay = topTimeForAnimation + (topTimeForAnimation / this.bottomCardList.length * idx);

            this.animation = item.dom.animate([{ left: this.#calculateLeftPosition(this.bottomCardList, idx) },],
                { duration: topTimeForAnimation, fill: "forwards", delay });

            //class추가
            item.dom.parentNode.classList.add('clickable');
        });
    }


    animateSuffle() {


        const top = this.#calculateVw(this.cardHeight + this.CARD_ROW_GAP) / 2;
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
                { duration: topTimeForAnimation, delay: delay });
        });

        this.bottomCardList.forEach((item, idx) => {
            //가운데 위치
            item.dom.animate([{ top: top + 'vw', left: '50%', transform: 'translateX(-50%)' },],
                { duration: 200, fill: "forwards" });

            //섞는 motion
            const delay = topTimeForAnimation / this.bottomCardList.length * idx;

            if (idx != 0) {
                this.animation = item.dom.animate([
                    { left: '50%' },
                    { left: '65%' },
                    { left: '50%', zIndex: this.bottomCardList.length + idx }
                ],
                    { duration: topTimeForAnimation, delay: delay });

            } else {
                item.dom.style.zIndex = idx;
            }
        });




        //카드 펼치기
        if (this.animation.playState != 'finished') {
            //애니메이션 중일때만.. 체크됨 
            this.animation.onfinish = () => {
                console.log(' suffle 애니메이션 끝')
                // this.positionCards();

                //위치 변경(0)
                this.cardList.forEach((item, idx) => {
                    item.dom.animate([{ top: 0, left: 0, transform: 'translateX(0)' }], { duration: 300, fill: 'forwards' })
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



                    //class추가
                    item.dom.parentNode.classList.add('clickable');
                });



                this.bottomCardList.forEach((item, idx) => {
                    //top
                    const topVw = this.#calculateVw(this.cardHeight + this.CARD_ROW_GAP) + 'vw';



                    //윗줄과 함께 이동
                    item.dom.animate([
                        { left: 0, top: 0 }, { left: rightPosition, top: 0 },],
                        { duration: topTimeForAnimation, fill: "forwards", delay: topDelay });
                    //아래줄로 이동
                    item.dom.animate([
                        { left: rightPosition, top: 0 }, { left: 0, top: topVw },],
                        { duration: 400, fill: "forwards", delay: topDelay + topTimeForAnimation });
                    //펼쳐지기
                    item.dom.animate([{ top: topVw, left: this.#calculateLeftPosition(this.bottomCardList, idx) },],
                        { duration: topTimeForAnimation, fill: "forwards", delay: topTimeForAnimation + topDelay + 400 });


                    // class추가
                    item.dom.parentNode.classList.add('clickable');
                });

            }
        } else {
            // this.positionCards();
        }

    }

    shuffle() {
        //class삭제
        this.cardField.querySelector('ul').classList.remove('clickable');

        //animation
        if (this.animation.playState != 'finished') {
            //애니메이션 중일때만.. 체크됨 
            this.animation.onfinish = () => {
                console.log('position 애니메이션 끝')
                this.randomCard();
                this.updateCardList();
                this.animateSuffle();
            }
        } else {
            this.randomCard();
            this.updateCardList();
            this.animateSuffle();
        }


        //완료후
        //class추가
        // this.cardField.querySelector('ul').classList.remove('clickable');

    }



    #calculateVw(px) {
        return ((px) / window.innerWidth * 100);
    }


    #calculateLeftPosition(cardList, idx) {
        let leftPx = (100 / cardList.length - 1);
        return Math.ceil(leftPx * idx + 1) + '%';
    }


    //animation
    //1. reset -> line
    //2. suffle
    //3. suffle -> line





    addEventListener() {

    }

}




