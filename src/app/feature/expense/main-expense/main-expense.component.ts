import { AfterViewInit, Component } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-main-expense',
  imports: [],
  templateUrl: './main-expense.component.html',
  styleUrl: './main-expense.component.scss'
})
export class MainExpenseComponent implements AfterViewInit {
  syncedSecondary = true
  constructor() {

  }
  ngAfterViewInit(): void {
    console.log('test1');
    let bigimage = $("#expenseEntry");
    var thumbs = $("#expenseHead");
    bigimage
      .owlCarousel({
        items: 1,
        slideSpeed: 4000,
        nav: true,
        autoplay: false,
        dots: false,
        loop: true,
        touchDrag: false,
        mouseDrag: false,
        responsiveRefreshRate: 200,
        autoHeight: true,
        navText: [
          '<i class="fa fa-arrow-left" aria-hidden="true"></i>',
          '<i class="fa fa-arrow-right" aria-hidden="true"></i>'
        ]
      })
      .on("changed.owl.carousel", this.syncPosition);

    thumbs
      .on("initialized.owl.carousel", function () {
        thumbs
          .find(".owl-item")
          .eq(0)
          .addClass("current");
      })
      .owlCarousel({
        items: 5,
        dots: true,
        nav: true,
        navText: [
          '<i class="fa fa-arrow-left" aria-hidden="true"></i>',
          '<i class="fa fa-arrow-right" aria-hidden="true"></i>'
        ],
        smartSpeed: 200,
        slideSpeed: 500,
        slideBy: 4,
        responsiveRefreshRate: 100
      })
      .on("changed.owl.carousel", this.syncPosition2);

    thumbs.on("click", ".owl-item", (e: any) => {
      e.preventDefault();
      var number = $(this).index();
      bigimage.data("owl.carousel").to(number, 300, true);
    });
  }

  syncPosition(el: any) {
    //if loop is set to false, then you have to uncomment the next line
    //var current = el.item.index;

    //to disable loop, comment this block
    var thumbs = $("#expenseHead");
    var count = el.item.count - 1;
    var current = Math.round(el.item.index - el.item.count / 2 - 0.5);

    if (current < 0) {
      current = count;
    }
    if (current > count) {
      current = 0;
    }
    //to this
    thumbs
      .find(".owl-item")
      .removeClass("current")
      .eq(current)
      .addClass("current");
    var onscreen = thumbs.find(".owl-item.active").length - 1;
    var start = thumbs
      .find(".owl-item.active")
      .first()
      .index();
    var end = thumbs
      .find(".owl-item.active")
      .last()
      .index();

    if (current > end) {
      thumbs.data("owl.carousel").to(current, 100, true);
    }
    if (current < start) {
      thumbs.data("owl.carousel").to(current - onscreen, 100, true);
    }
  }

  syncPosition2(el: any) {
    let bigimage = $("#expenseEntry");
    if (this.syncedSecondary) {
      var number = el.item.index;
      bigimage.data("owl.carousel").to(number, 100, true);
    }
  }

}
