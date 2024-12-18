import { type Event, type ReadEvent } from '../../typing';
import type {
  DefaultEventStoreOptions,
  EventStore,
  EventStoreReadEventMetadata,
} from '../eventStore';

type AfterEventStoreCommitHandlerWithoutContext<Store extends EventStore> = (
  messages: ReadEvent<Event, EventStoreReadEventMetadata<Store>>[],
) => Promise<void> | void;

export type AfterEventStoreCommitHandler<
  Store extends EventStore,
  HandlerContext = never,
> = [HandlerContext] extends [never] // Exact check for never
  ? AfterEventStoreCommitHandlerWithoutContext<Store>
  :
      | ((
          messages: ReadEvent<Event, EventStoreReadEventMetadata<Store>>[],
          context: HandlerContext,
        ) => Promise<void> | void)
      | AfterEventStoreCommitHandlerWithoutContext<Store>;

type TryPublishMessagesAfterCommitOptions<
  Store extends EventStore,
  HandlerContext = never,
> = {
  onAfterCommit?: AfterEventStoreCommitHandler<Store, HandlerContext>;
};

export async function tryPublishMessagesAfterCommit<Store extends EventStore>(
  messages: ReadEvent<Event, EventStoreReadEventMetadata<Store>>[],
  options: DefaultEventStoreOptions<Store, undefined> | undefined,
): Promise<void>;
export async function tryPublishMessagesAfterCommit<
  Store extends EventStore,
  HandlerContext,
>(
  messages: ReadEvent<Event, EventStoreReadEventMetadata<Store>>[],
  options:
    | TryPublishMessagesAfterCommitOptions<Store, HandlerContext>
    | undefined,
  context: HandlerContext,
): Promise<void>;
export async function tryPublishMessagesAfterCommit<
  Store extends EventStore,
  HandlerContext = never,
>(
  messages: ReadEvent<Event, EventStoreReadEventMetadata<Store>>[],
  options:
    | TryPublishMessagesAfterCommitOptions<Store, HandlerContext>
    | undefined,
  context?: HandlerContext,
): Promise<void> {
  if (options?.onAfterCommit === undefined) return;

  try {
    await options?.onAfterCommit(messages, context!);
  } catch (error) {
    // TODO: enhance with tracing
    console.error(`Error in on after commit hook`, error);
  }
}
