import type { BoxModel, Position } from 'css-box-model';
import type {
  Axis,
  DroppableDimension,
  DroppableDescriptor,
  Scrollable,
  DroppableSubject,
  ScrollSize,
} from '../../types';
import { vertical, horizontal, grid } from '../axis';
import { origin } from '../position';
import getMaxScroll from '../get-max-scroll';
import getSubject from './util/get-subject';

export interface Closest {
  client: BoxModel;
  page: BoxModel;
  scroll: Position;
  scrollSize: ScrollSize;
  shouldClipSubject: boolean;
}

interface Args {
  descriptor: DroppableDescriptor;
  isEnabled: boolean;
  isCombineEnabled: boolean;
  isFixedOnPage: boolean;
  direction: 'vertical' | 'horizontal' | 'grid';
  client: BoxModel;
  // is null when in a fixed container
  page: BoxModel;
  closest?: Closest | null;
}

export default ({
  descriptor,
  isEnabled,
  isCombineEnabled,
  isFixedOnPage,
  direction,
  client,
  page,
  closest,
}: Args): DroppableDimension => {
  const frame: Scrollable | null = (() => {
    if (!closest) {
      return null;
    }

    const { scrollSize, client: frameClient } = closest;

    // scrollHeight and scrollWidth are based on the padding box
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
    const maxScroll: Position = getMaxScroll({
      scrollHeight: scrollSize.scrollHeight,
      scrollWidth: scrollSize.scrollWidth,
      height: frameClient.paddingBox.height,
      width: frameClient.paddingBox.width,
    });

    return {
      pageMarginBox: closest.page.marginBox,
      frameClient,
      scrollSize,
      shouldClipSubject: closest.shouldClipSubject,
      scroll: {
        initial: closest.scroll,
        current: closest.scroll,
        max: maxScroll,
        diff: {
          value: origin,
          displacement: origin,
        },
      },
    };
  })();

  const axis: Axis =
    direction === 'vertical'
      ? vertical
      : direction === 'grid'
      ? grid
      : horizontal;

  const subject: DroppableSubject = getSubject({
    page,
    withPlaceholder: null,
    axis,
    frame,
  });

  const dimension: DroppableDimension = {
    descriptor,
    isCombineEnabled,
    isFixedOnPage,
    axis,
    isEnabled,
    client,
    page,
    frame,
    subject,
  };

  return dimension;
};
