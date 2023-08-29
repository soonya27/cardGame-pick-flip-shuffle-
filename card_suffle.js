
// shuffle -> 섞는 animation
// 카드 원형? 정렬
// 카드 호선 정렬

//플립 모션 -> 수정구슬...? 화면에 보여지고 아래로 펼쳐지는..?

//script -> left, transform 조정시 inline 으로... -> class추가형식으로.. animation대체가능


class TaroCard {
    constructor() {
        this.cardField = document.querySelector('.card-select-wrap');
        this.MAXCARDS_NUM = 12;
        this.cardList = [];
        // console.log(this.cardField.clientWidth);
        // this.cardInterval = this.cardField.clientWidth / 

    }

    init(cardObj) {
        this.cardCount = cardObj.length;
        cardObj.map(item => this.cardList.push({ data: item }));

        this.randomCard();
        // console.log(this.cardList)


        this.renderCard();

        var img = new Image();
        img.onload = () => {
            this.positionCards();
            // window.addEventListener('resize', () => {
            //     this.positionCards();
            // });
        };
        img.src = '/cover.png';

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

            cardLi.innerHTML = `<img src="${item.data.imgUrl}" alt="">`;
            cardUl.appendChild(cardLi);
        });
        cardUl.style.flexWrap = 'wrap';

        //hover event
        // this.cardList.forEach(item => {
        //     item.dom.addEventListener('mouseover', function (e) {
        //         if (!this.parentNode.classList.contains('clickable')) {
        //             return;
        //         }
        //         const change = parseInt(calculateTransform(this)) + -7;
        //         item.dom.style.transform = `translateY(${change}%)`;
        //     })
        //     item.dom.addEventListener('mouseout', function () {
        //         if (!this.parentNode.classList.contains('clickable')) {
        //             return;
        //         }
        //         const change = parseInt(calculateTransform(this)) + 7;
        //         item.dom.style.transform = `translateY(${change}%)`;
        //     });
        // });
        // function calculateTransform(item) {
        //     const tarnsform = item.style.transform
        //     const stNum = tarnsform.indexOf('(') + 1;
        //     const edNum = tarnsform.indexOf('%');
        //     return tarnsform.slice(stNum, edNum) || 0;
        // }
    }

    ChangeCardList() {

        this.cardField.querySelectorAll('li').forEach((item, idx) => {

            item.setAttribute('data-id', '');
            item.setAttribute('data-id', this.cardList[idx].data.id);
            this.cardList[idx].dom = item;
            item.querySelector('img').src = this.cardList[idx].data.imgUrl;
        })


    }




    positionCards() {
        //position 위치
        //render전이라 height를 제대로 못가져옴.. -> 이미지로드후 사이즈

        // console.log(topCards.length)
        // console.log((topCards.length / this.cardField.clientWidth * 100))
        const MAXPERCENT = 100 - (this.cardList[0].clientWidth / this.cardField.clientWidth * 100);

        // console.log(MAXPERCENT)
        // console.log(MAXPERCENT)

        const topTimeForAnimation = 700;
        this.topCardList.forEach((item, idx) => {
            let leftPx = (100 / this.topCardList.length - 1);
            const delay = topTimeForAnimation / this.topCardList.length * idx;
            // $(item.dom).delay(delay).animate({ left: Math.ceil(leftPx * idx + 1) + '%' })

            item.dom.animate([
                { left: Math.ceil(leftPx * idx + 1) + '%' }],
                { duration: topTimeForAnimation, fill: "forwards", delay });
            //class추가
            item.dom.parentNode.classList.add('clickable');
        });

        this.bottomCardList.forEach((item, idx) => {
            //top
            this.cardHeight = document.querySelector('.card-select-wrap li').offsetHeight;
            this.cardFullHeight = ((this.cardHeight + 20) / window.innerWidth * 100) * 2;
            const topPx = ((this.cardHeight + 20) / window.innerWidth * 100);
            item.dom.style.top = topPx + 'vw';

            //left
            let leftPx = (100 / this.bottomCardList.length - 1);
            const delay = topTimeForAnimation + (topTimeForAnimation / this.bottomCardList.length * idx);


            // $(item.dom).delay(delay).animate({ left: Math.ceil(leftPx * idx + 1) + '%' }, topTimeForAnimation);
            this.animation = item.dom.animate([{ left: Math.ceil(leftPx * idx + 1) + '%' },],
                { duration: topTimeForAnimation, fill: "forwards", delay });

            //class추가
            item.dom.parentNode.classList.add('clickable');
        });

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

    animateSuffle(resolve) {
        //섞는 motion animation
        //가운데 위치
        const top = ((this.cardHeight + 20) / window.innerWidth * 100) / 2;
        const topTimeForAnimation = 1500;
        this.topCardList.slice().reverse().forEach((item, idx) => {
            // $(item.dom).stop();
            // console.log(this.animation.pause())
            // console.log(item)
            // console.log(this.cardFullHeight / 2)
            item.dom.animate([{ top: top + 'vw', left: '50%', transform: 'translateX(-50%)' },],
                { duration: 200, fill: "forwards" });


            const delay = topTimeForAnimation / this.topCardList.length * idx;
            // item.dom.animate([{ transform: 'translateX(-50%)' }, { transform: 'translateX(-20%)' }, { transform: 'translateX(-80%)' }, { transform: 'translateX(-20%)' }],
            item.dom.animate([{ left: '50%' }, { left: '43%' }, { left: '58%' }, { left: '43%' }, { left: '50%', zIndex: '1' }],
                { duration: topTimeForAnimation, delay: delay });

        });
        this.bottomCardList.slice().reverse().forEach((item, idx) => {
            // $(item.dom).stop();

            // item.dom.style.left = '50%';
            // item.dom.style.transform = 'translate(-50%,60%)';

            item.dom.animate([{ top: top + 'vw', left: '50%', transform: 'translateX(-50%)' },],
                { duration: 200, fill: "forwards" });

            const delay = topTimeForAnimation / this.bottomCardList.length * idx;
            // item.dom.animate([{ transform: 'translateX(-50%)' }, { transform: 'translateX(-20%)' }, { transform: 'translateX(-80%)' }, { transform: 'translateX(-20%)' }],
            this.animation = item.dom.animate([{ left: '50%' }, { left: '43%', zIndex: '1' }, { left: '58%' }, { left: '43%' }, { left: '50%', zIndex: '0' }],
                { duration: topTimeForAnimation, delay: delay });

        });
        //animation
        if (this.animation.playState != 'finished') {
            //애니메이션 중일때만.. 체크됨 
            this.animation.onfinish = () => {
                console.log(' suffle 애니메이션 끝')
                // this.positionCards();

                //위치 변경(0)
                this.cardList.forEach((item, idx) => {
                    item.dom.animate([{ top: 0, left: 0, transform: 'translateX(0)' }], { duration: 300, fill: 'forwards' })
                });

                const topTimeForAnimation = 700;
                let rightPosition = 0;
                let topDelay = 0;
                this.topCardList.forEach((item, idx) => {

                    let leftPx = (100 / this.topCardList.length - 1);
                    if (idx == 0) {
                        leftPx = 0;
                    }
                    const delay = topTimeForAnimation / this.topCardList.length * idx;
                    item.dom.animate([
                        { left: Math.ceil(leftPx * idx + 1) + '%' }],
                        { duration: topTimeForAnimation, fill: "forwards", delay });

                    rightPosition = Math.ceil(leftPx * idx + 1) + '%'
                    topDelay = delay;
                    //class추가
                    // item.dom.parentNode.classList.add('clickable');
                });



                this.bottomCardList.forEach((item, idx) => {
                    //top
                    const topPx = ((this.cardHeight + 20) / window.innerWidth * 100);

                    //left
                    let leftPx = (100 / this.bottomCardList.length - 1);
                    const delay = topTimeForAnimation + (topTimeForAnimation / this.bottomCardList.length * idx);


                    // item.dom.style.left = 0;
                    // item.dom.style.top = topPx + 'vw';
                    item.dom.animate([
                        { left: 0, top: 0 }, { left: rightPosition, top: 0 },],
                        { duration: topDelay, fill: "forwards", delay: topDelay });

                    item.dom.animate([
                        { left: rightPosition, top: 0 }, { left: 0, top: topPx + 'vw' },],
                        { duration: 400, fill: "forwards", delay: topDelay + topTimeForAnimation });


                    item.dom.animate([{ top: topPx + 'vw', left: Math.ceil(leftPx * idx + 1) + '%' },],
                        { duration: topTimeForAnimation, fill: "forwards", delay: delay + topDelay + 400 });

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
                this.ChangeCardList();
                // this.renderCard();
                this.animateSuffle();
            }
        } else {
            this.randomCard();
            // this.renderCard();
            this.ChangeCardList();

            this.animateSuffle();
        }



        //완료후
        //class추가
        // this.cardField.querySelector('ul').classList.remove('clickable');

    }


    randomCard() {
        this.cardList.sort(() => Math.random() - 0.5);

        this.topCardList = Array.from(this.cardList).slice(0, this.MAXCARDS_NUM);
        this.bottomCardList = Array.from(this.cardList).slice(this.MAXCARDS_NUM);
        console.log(this.cardList);
    }



    addEventListener() {

    }

}




