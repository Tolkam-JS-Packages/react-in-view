import { PureComponent, cloneElement, Children, ReactElement, HTMLProps } from 'react';
import { classNames, closestScrollingParent } from '@tolkam/lib-utils-ui'
import InViewTracker, {
    IOptions,
    IOffset,
    TOffset,
    TPercentageMode,
    IVisibility,
    ISubject,
    IContext
} from '@tolkam/lib-in-view';

export default class InView extends PureComponent<IProps> {

    /**
     * @type {HTMLElement}
     */
    protected element: HTMLElement;

    /**
     * @type {InViewTracker|undefined}
     */
    protected tracker: InViewTracker|undefined;

    /**
     * @var {string}
     */
    protected lastClassesHash: string;

    /**
     * @var {number}
     */
    protected lastScrollDirY: number;

    /**
     * @var {number}
     */
    protected lastScrollDirX: number;

    /**
     * @var {number}
     */
    protected prevScrollDirY: number;

    /**
     * @var {number}
     */
    protected prevScrollDirX: number;

    /**
     * @inheritDoc
     */
    public componentDidMount() {
        const that = this;
        const { track } = that.props;

        if (track) {
            that.element = track;
        }

        that.start();
        // that.recalculate();

        setTimeout(that.recalculate, 0);
    }

    /**
     * @inheritDoc
     */
    public componentWillUnmount() {
        this.stop();
    }

    /**
     * @inheritDoc
     */
    public render() {
        const that = this;
        const {props} = that;
        let children = props.children;

        if(!children) {
            return null;
        }

        // merge class names
        const childrenProps: any = {
            className: classNames(children.props.className, props.className),
        };

        if (!props.track) {
            childrenProps.ref = (r: HTMLElement) => that.element = r;
        }

        return cloneElement(Children.only(props.children), childrenProps);
    }

    /**
     * Recalculates visibility
     */
    public recalculate =() => {
        const tracker = this.tracker;
        tracker && tracker.recalculate();
    }

    /**
     * Starts element tracking
     *
     * @returns {InViewTracker}
     */
    public start = () => {
        const that = this;
        const {props, element} = that;

        // element is not ready yet
        if(!element) {
            return;
        }

        const options: IOptions = {};

        options.context = props.parent
            || props.parentAutodetect ? closestScrollingParent(element) : undefined;

        if (props.offsetPercentageMode) {
            options.offsetPercentageMode = props.offsetPercentageMode;
        }

        if (props.windowEvents) {
            options.windowEvents = props.windowEvents;
        }

        if (props.offset) {
            options.offset = props.offset;
        }

        that.tracker = new InViewTracker(that.element, that.track, options);
    }

    /**
     * Stops element tracking
     *
     * @returns {void}
     */
    public stop() {
        const that = this;
        const { tracker } = that;

        if (tracker) {
            tracker.stop();
            that.tracker = undefined;
        }
    }

    /**
     * Tracks element visibility
     *
     * @param {IVisibility} v
     */
    protected track = (v: IVisibility) => {
        const that = this;
        const { tracker, element, props } = that;
        const {onChanges, classesTarget, classNamesPrefix} = props;
        const classNameRoot = (classNamesPrefix || '') + '-';
        let classesHash = '';

        if (!tracker) {
            return;
        }

        const classList = (classesTarget ?? element).classList;
        const { subject, context } = tracker;
        const { DIR_NONE } = context;
        let scrollDirY = context.scrollDirY;
        let scrollDirX = context.scrollDirX;

        // visibility classes
        const classNames = {
            // [props.className || '']: true,
            [classNameRoot + 'visible']: v.visible,
            [classNameRoot + 'TL']: v.topLeft,
            [classNameRoot + 'TR']: v.topRight,
            [classNameRoot + 'BL']: v.bottomLeft,
            [classNameRoot + 'BR']: v.bottomRight,
        };

        if (props.withDirection) {

            // remember last scroll direction when current update is from non-scroll event (resize, for ex.)
            if (props.preserveDirection) {
                if (scrollDirY === DIR_NONE) {
                    scrollDirY = that.prevScrollDirY;
                }
                if (scrollDirX === DIR_NONE) {
                    scrollDirX = that.prevScrollDirX;
                }
            }

            classNames[classNameRoot + 'dir-Y-none'] = scrollDirY === DIR_NONE;
            classNames[classNameRoot + 'dir-Y-down'] = scrollDirY === context.DIR_DOWN;
            classNames[classNameRoot + 'dir-Y-up'] = scrollDirY === context.DIR_UP;

            classNames[classNameRoot + 'dir-X-none'] = scrollDirX === DIR_NONE;
            classNames[classNameRoot + 'dir-X-left'] = scrollDirX === context.DIR_LEFT;
            classNames[classNameRoot + 'dir-X-right'] = scrollDirX === context.DIR_RIGHT;

            // keep track of previous scroll direction
            that.prevScrollDirY = scrollDirY || DIR_NONE;
            that.prevScrollDirX = scrollDirX || DIR_NONE;
        }

        for (const name in classNames) {
            if (classNames[name] === true && v.rendered) {
                classesHash += ' ' + name;
            }
        }
        classesHash = classesHash.trim();

        // on changes
        if (classesHash !== that.lastClassesHash) {

            // add classes
            if (props.noClasses !== true) {
                that.lastClassesHash && classList.remove(...that.lastClassesHash.split(' '));
                classesHash && classList.add(...classesHash.split(' '));
            }

            onChanges && onChanges(v, () => that.stop(), subject, context);

            that.lastClassesHash = classesHash;
        }
    }
}

export interface IProps extends HTMLProps<InView> {

    // single child only
    children: ReactElement,

    // scrolling parent element
    parent?: HTMLElement;

    // whether to autodetect the closest scrollable parent
    parentAutodetect?: boolean;

    // external element to track
    track?: HTMLElement;

    // target element to set classes onto (e.g. some parent)
    classesTarget?: HTMLElement;

    // do not add state classes
    noClasses?: boolean;

    // state class names prefix
    classNamesPrefix?: string;

    // extra window event names to track
    windowEvents?: string[];

    // track scroll direction changes
    withDirection?: boolean;

    // preserve last known direction on resize
    preserveDirection?: boolean;

    // track offsets
    offset?: IOffset;
    offsetPercentageMode?: TPercentageMode;

    // visibility change callback
    onChanges?: (v: IVisibility, stop: TStopFn, subject: ISubject, context: IContext) => void;
}

export type TStopFn = () => void;

export { ISubject, IContext, IVisibility, IOffset, TOffset };
