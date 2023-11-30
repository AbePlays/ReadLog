function composeEventHandlers<E>(originalEventHandler?: (event: E) => void, ourEventHandler?: (event: E) => void) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event)

    if (!(event as Event).defaultPrevented) {
      return ourEventHandler?.(event)
    }
  }
}

export { composeEventHandlers }
