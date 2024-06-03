import {LitElement, html, css} from 'lit';
import {
    customElement,
    property,
    queryAssignedElements,
    state,
} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import './slide-button.js';
import {
    BOOTSTRAP_CHEVRON_LEFT,
    BOOTSTRAP_CHEVRON_RIGHT,
    AnimationTuple,
    SLIDE_LEFT_IN,
    SLIDE_LEFT_OUT,
    SLIDE_RIGHT_IN,
    SLIDE_RIGHT_OUT
} from './constants';

@customElement('simple-carousel')
export class SimpleCarousel extends LitElement {
    static override styles = css`
        ::slotted(.slide-hidden) {
            display: none;
        }

        /** So the elements all overlap */

        ::slotted(*) {
            position: absolute;
            padding: 1em;
        }

        :host {
            display: flex;
            flex-direction: row;
            align-items: center;
        }

        #container {
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            margin: 0 18px;
            padding: 1em;
            overflow: hidden;
            position: relative;
            box-shadow: var(--shadow, gray) 0.3em 0.3em 0.4em,
            var(-highlight, white) -0.1em -0.1em 0.3em;
        }
    `;
    @state() private containerHeight = 0;
    @property({type: Number}) slideIndex = 0;
    @queryAssignedElements()
    private readonly slideElements!: HTMLElement[];

    override render() {
        const containerStyles = {height: `${this.containerHeight}px`};

        return html`
            <slide-button @click=${this.navigateToPrevSlide}>
                ${BOOTSTRAP_CHEVRON_LEFT}
            </slide-button>
            <div id="container" style="${styleMap(containerStyles)}">
                <slot></slot>
            </div>
            <slide-button @click=${this.navigateToNextSlide}>
                ${BOOTSTRAP_CHEVRON_RIGHT}
            </slide-button>`;
    }

    override firstUpdated() {
        this.containerHeight = getMaxElHeight(this.slideElements);
        this.initializeSlide();
    }

    private initializeSlide() {
        for (let i = 0; i < this.slideElements.length; i++) {
            if (i === this.slideIndex) {
                showSlide(this.slideElements[i]);
            } else {
                hideSlide(this.slideElements[i]);
            }
        }
    }

    private navigateToPrevSlide() {
        this.navigateWithAnimation(-1, SLIDE_RIGHT_OUT, SLIDE_LEFT_IN);

    }

    private navigateToNextSlide() {
        this.navigateWithAnimation(1, SLIDE_LEFT_OUT, SLIDE_RIGHT_IN);
    }

    private changeSlide(offset: number) {
        const slideCount = this.slideElements.length;
        this.slideIndex =
            (slideCount + ((this.slideIndex + offset) % slideCount)) % slideCount;
    }

    private async navigateWithAnimation(nextSlideOffset: number, leavingAnimation: AnimationTuple, enteringAnimation: AnimationTuple) {
        const elLeaving = this.slideElements[this.slideIndex];
        const leavingAnim = elLeaving.animate(leavingAnimation[0], leavingAnimation[1]);

        this.changeSlide(nextSlideOffset);
        const newSlideEl = this.slideElements[this.slideIndex];

        showSlide(newSlideEl);

        const entringAnim = newSlideEl.animate(
            enteringAnimation[0],
            enteringAnimation[1]
        );

        await Promise.all([leavingAnim.finished, entringAnim.finished]);
        hideSlide(elLeaving);
    }
}

function hideSlide(el: HTMLElement) {
    el.classList.add('slide-hidden');
}

function showSlide(el: HTMLElement) {
    el.classList.remove('slide-hidden');
}

function getMaxElHeight(els: HTMLElement[]): number {
    return Math.max(0, ...els.map((el) => el.getBoundingClientRect().height));
}

declare global {
    interface HTMLElementTagNameMap {
        'simple-carousel': SimpleCarousel;
    }
}
