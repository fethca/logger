# Logger

## Usage
Install package:

```bash
yarn add @fethcat/logger
```

Create logger with message and options:

```typescript
import { Logger, LoggerOptions } from '@fethcat/logger'

const logger = Logger.create<'my_action_message'>(
  'instanceId',
  { silent: false },
  { app: 'app', env: 'env', version: 'version' }
)
logger.info('my_app_message', { meta: 'value' })
```

## Actions

```typescript
import { Logger, LoggerOptions } from '@fethcat/logger'

const logger = Logger.create<'my_action_message'>(
  'instanceId',
  { silent: false },
  { app: 'app', env: 'env', version: 'version' }
)

const { success, failure } = logger.start('my_action_message', { meta: 'value' }) // Logs "my_action_message" with meta { meta: 'value' }

try {
  // Do something
  success({ another: 'meta' }) // Logs "my_action_message_success" with meta { meta: 'value', another: 'meta' }
} catch (error) {
  failure(error, { another: 'meta' }) // Logs "my_action_message_failure" with meta { meta: 'value', another: 'meta', error }
}
```

## Options

The following options are available:

| Name   | Type    | Default value | Description                             |
| ------ | ------- | ------------- | --------------------------------------- |
| silent | boolean | false         | Whether the logger should silent or not |
