/* global describe, test, expect */

import { vi } from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import MaterialSymbolsButton from './index.jsx'

const renderComponent = () => {
    render(
        <MaterialSymbolsButton
            ariaLabel="test"
            text="test text"
            onClickHandler={() => {}}
        />
    );
}

describe("UI/DOM Testing...", () => {
    describe("The button element...", () => {
        test(`Should have an accessible name (aria-label) attribute whose value
         is the same as the provided 'ariaLabel' prop's value`, () => {
            renderComponent();
            const button = screen.getByRole("button");
            expect(button).toBeInTheDocument;
        });
    });
    describe("The element displaying the text...", () => {
        test(`Should have textContent equal to the provided 'text' prop's value`, () => {
            renderComponent();
            expect(screen.getByText(/test text/i)).toBeInTheDocument();
        });
    });
    describe("The provided onClickHandler callback function...", () => {
        test(`Should be invoked when the button is clicked`, async () => {
            const user = userEvent.setup();
            const onClickHandler = vi.fn();
            render(
                <MaterialSymbolsButton
                    ariaLabel="test"
                    text="test text"
                    onClickHandler={onClickHandler}
                />
            );
            const button = screen.getByRole("button");
            await user.click(button);
            expect(onClickHandler).toHaveBeenCalledTimes(1);
        });
    });
});