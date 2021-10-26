# tolkam/react-in-view

Adds css classes depending on element visibility within its parent.

## Usage

````tsx
import { render } from 'react-dom';
import InView from '@tolkam/react-in-view';

const scrollingParent = <div className="myScrollingParent">
    <InView>
        <div>Track me and update my classes!</div>
    </InView>
</div>

render(scrollingParent, document.getElementById('app'));
````

## Documentation

The code is rather self-explanatory and API is intended to be as simple as possible. Please, read the sources/Docblock if you have any questions. See [Usage](#usage) and [IProps](/src/index.tsx#L235) for quick start.

## License

Proprietary / Unlicensed 🤷
