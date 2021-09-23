import {
  Directive,
  ElementRef,
  OnInit,
  Input,
  HostListener,
  Renderer2,
  AfterViewInit,
} from '@angular/core';

@Directive({
  selector: '[appResizable]', // Attribute selector
})
export class ResizableDirective implements OnInit, AfterViewInit {
  @Input() resizableGrabWidth: number = 8;
  @Input() resizableMinWidth: number = 10;

  dragging: boolean = false;
  position: string = 'left';

  original_width: number = 0;
  original_mouse_x: number = 0;
  element_left: number = 0;
  element_right: number = 0;
  parentWidth: number = 0;
  parentOffsetLeft: number = 0;

  constructor(private el: ElementRef, private render: Renderer2) {}

  // preventGlobalMouseEvents() {
  //   this.render.setStyle(document.body, 'pointer-events', 'none');
  // }

  // restoreGlobalMouseEvents() {
  //   this.render.removeStyle(document.body, 'pointer-events');
  // }

  inDragRegion(event: MouseEvent) {
    return (
      (event.pageX - this.el.nativeElement.getBoundingClientRect().right < 0 &&
        event.pageX - this.el.nativeElement.getBoundingClientRect().right >
          -this.resizableGrabWidth) ||
      (event.pageX - this.el.nativeElement.getBoundingClientRect().left <
        this.resizableGrabWidth &&
        event.pageX - this.el.nativeElement.getBoundingClientRect().left > 0)
    );
  }
  newWidth(wid: number) {
    this.render.setStyle(this.el.nativeElement, 'width', wid + 'px');
  }

  resizeAllowed(event: MouseEvent) {
    let width: number;
    switch (this.position) {
      case 'left':
        width = this.original_width - (event.pageX - this.original_mouse_x);

        if (
          this.element_left + (event.pageX - this.original_mouse_x) > 0 &&
          width > this.resizableMinWidth + this.resizableGrabWidth * 2 &&
          width > this.resizableGrabWidth * 2
        ) {
          return true;
        }
        return false;

      case 'right':
        width = this.original_width + (event.pageX - this.original_mouse_x);

        if (
          this.element_right -
            this.parentOffsetLeft +
            (event.pageX - this.original_mouse_x) <
            this.parentWidth &&
          width > this.resizableMinWidth + this.resizableGrabWidth * 2 &&
          width > this.resizableGrabWidth * 2
        ) {
          return true;
        }
        return false;
      default:
        return false;
    }
  }

  @HostListener('document:mousemove', ['$event']) mouseMoveG(
    event: MouseEvent
  ) {
    if (!this.dragging || !this.resizeAllowed(event)) {
      return;
    }
    let width: number = 0;

    switch (this.position) {
      case 'right':
        width = this.original_width + (event.pageX - this.original_mouse_x);
        this.render.setStyle(
          this.el.nativeElement,
          'right',
          this.element_right + (event.pageX - this.original_mouse_x) + 'px'
        );
        break;
      case 'left':
        width = this.original_width - (event.pageX - this.original_mouse_x);
        this.render.setStyle(
          this.el.nativeElement,
          'left',
          this.element_left + (event.pageX - this.original_mouse_x) + 'px'
        );

        break;
      default:
        break;
    }
    this.newWidth(width);

    event.stopPropagation();
  }

  @HostListener('document:mouseup', ['$event']) mouseUpG(event: MouseEvent) {
    if (!this.dragging) {
      return;
    }
    // this.restoreGlobalMouseEvents();
    this.dragging = false;
    event.stopPropagation();
  }

  @HostListener('mousedown', ['$event']) mouseDown(event: MouseEvent) {
    if (this.inDragRegion(event)) {
      this.dragging = true;
      const element = this.el.nativeElement.getBoundingClientRect();
      this.original_width = element.width;

      this.element_left = element.left - this.parentOffsetLeft;
      this.element_right = element.right;

      this.original_mouse_x = event.pageX;
      if (
        event.pageX - element.right < 0 &&
        event.pageX - element.right > -this.resizableGrabWidth
      ) {
        this.position = 'right';

        this.render.setStyle(
          this.el.nativeElement,
          'left',
          this.element_left + 'px'
        );
      } else if (
        event.pageX - element.left < this.resizableGrabWidth &&
        event.pageX - element.left > 0
      ) {
        this.position = 'left';

        this.render.setStyle(
          this.el.nativeElement,
          'right',
          this.element_right + 'px'
        );
      }

      // this.preventGlobalMouseEvents();
      event.stopPropagation();
    }
  }
  @HostListener('mousemove', ['$event']) mouseMove(event: MouseEvent) {
    if (this.inDragRegion(event) || this.dragging) {
      this.render.setStyle(this.el.nativeElement, 'cursor', 'col-resize');
    } else {
      this.render.removeStyle(this.el.nativeElement, 'cursor');
    }
  }

  ngOnInit(): void {
    const element = this.el.nativeElement.getBoundingClientRect();
    this.parentWidth = this.el.nativeElement.offsetParent.clientWidth;
    this.parentOffsetLeft = this.el.nativeElement.offsetParent.offsetLeft;
    this.element_left = element.left - this.parentOffsetLeft;
    this.element_right = element.right;
    const border: string = this.resizableGrabWidth + 'px solid darkgrey';
    this.render.setStyle(this.el.nativeElement, 'border-right', border);
    this.render.setStyle(this.el.nativeElement, 'border-left', border);

    this.render.setStyle(
      this.el.nativeElement,
      'right',
      this.element_right + 'px'
    );
    this.render.setStyle(
      this.el.nativeElement,
      'left',
      this.element_left + 'px'
    );
  }
  ngAfterViewInit() {
    this.render.setStyle(this.el.nativeElement, 'position', 'absolute');
  }
}
