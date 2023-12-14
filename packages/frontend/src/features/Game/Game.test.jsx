/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { forwardRef } from 'react'
import Game from './index.jsx'

import * as fetchAPI from "./utils/fetchAPI.js";

import MaterialSymbolsButton from '@/components/MaterialSymbolsButton'

const renderComponent = () => {
    render(<Game />);
}

const startGame = async (user) => {
    renderComponent();
    const startGameButton = screen.getByRole("button", { name: /Start Game/i });
    await user.click(startGameButton);
}

vi.mock('@/features/NavBar/components/NavigationButton', () => ({ 
    default: ({
        text,
        onClickHandler,
        link,
    }) => {
        return (<></>);
    }
}));

vi.mock('./components/HighScoreForm', () => ({ 
    default: ({
        onCloseHandler,
        onSubmitHandler,
        submissionErrors,
    }) => {
        return (
            <div
                aria-label="high-score-form"
            >
                <MaterialSymbolsButton onClickHandler={onCloseHandler}/>
                <form method="POST" action="">
                    <label>First Name *
                        <input
                            type="text"
                            id="first-name"
                            name="first_name"
                            required
                            defaultValue="John"
                        ></input>
                    </label>
                    <label>Last Name *
                        <input
                            type="text"
                            id="last-name"
                            name="last_name"
                            required
                            defaultValue="Smith"
                        ></input>
                    </label>
                    <button
                        aria-label="submit-high-score-from-form"
                        type="submit"
                        onClick={(e) => { onSubmitHandler(e); }}
                    ></button>
                </form>
            </div>
        );
    }
}));

vi.mock('@/components/MaterialSymbolsButton', () => ({ 
    default: ({
        onClickHandler,
    }) => {
        return (
            <button
                onClick={(e) => {
                    onClickHandler(e);
                }}
                aria-label="material-symbols-button"
            ></button>
        );
    }
}));

vi.mock('./components/TimeCounter', () => ({ 
    default: ({
        startTime,
        counting,
    }) => {
        return (<></>);
    }
}));

const image = null;
const imageSize = [800, 800];
const characters = [
    {
        id: "1",
        name: "1",
        imageUrl: null
    },
    {
        id: "2",
        name: "2",
        imageUrl: null
    },
    {
        id: "3",
        name: "3",
        imageUrl: null
    }
];
const getGameInformationResponse = {
    gameInfo: {
        imageUrl: image,
        imageSize: imageSize,
        characters: characters,
    },
    charactersFound: [],
    timeTaken: 0,
}
const characterSelectionResponse = {
    success: true,
    charactersFound: [],
    timeTaken: 0,
}
const getGameInformation = vi.fn(() => {
    return { ...getGameInformationResponse };
})
const postCharacterSelection = vi.fn(() => {
    return { ...characterSelectionResponse };
});
const postHighScoreSubmission = vi.fn(() => {
    return true;
});
vi.mock('./utils/fetchAPI', async () => {
    const actual = await vi.importActual("./utils/fetchAPI");
    return {
        ...actual,
        getGameInformation: () => getGameInformation(),
        postCharacterSelection: () => postCharacterSelection(),
        postHighScoreSubmission: () => postHighScoreSubmission(),
    }
});

describe("UI/DOM Testing...", () => {
    describe("The title of the characters remaining area...", () => {
        test("Should exist on the page", () => {
            renderComponent();
            const charactersRemainingTitle = screen.getByRole("heading", { name: "characters-remaining" });
            expect(charactersRemainingTitle).toBeInTheDocument();
        });
    });
    describe("The list of the characters remaining...", () => {
        test(`Should contain the same number of children as characters returned
         from the server`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const characters = screen.getAllByRole("listitem", { name: "character-remaining" });
            expect(characters.length).toBe(3);
        });
        test(`Should NOT contain any characters that have been successfully
         selected`, async () => {
            const user = userEvent.setup();
            postCharacterSelection.mockReturnValueOnce({
                ...characterSelectionResponse,
                charactersFound: [{
                    id: "1",
                    position: [0, 0],
                    width: 0,
                    height: 0,
                }]
            });
            await startGame(user);
            expect(screen.queryByText("1")).not.toBeNull();
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const charSelectionOptions = screen.getAllByRole("listitem", { name: "character-selection-option" });
            await user.click(charSelectionOptions[0]);
            expect(screen.queryByText("1")).toBeNull();
        });
        test(`Should each have an <img> element displaying the character`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const characterImages = screen.getAllByRole("img", { name: "character-image" });
            expect(characterImages.length).toBe(3);
        });
    });
    describe("The 'Start Game' button...", () => {
        test("Should exist on the page by default", () => {
            renderComponent();
            const startGameButton = screen.getByRole("button", { name: /Start Game/i });
            expect(startGameButton).toBeInTheDocument();
        });
        test("When clicked, should be removed", async () => {
            const user = userEvent.setup();
            await startGame(user);
            const startGameButton = screen.queryByRole("button", { name: /Start Game/i });
            expect(startGameButton).toBeNull();
        });
    });
    describe("The Game Image...", () => {
        test("Should not exist on the page before the game has started", () => {
            renderComponent();
            const gameImage = screen.queryByRole("img", { name: "Image containing the characters to locate." });
            expect(gameImage).toBeNull();
        });
        test(`Should be loaded in when the 'Start Game' button has just been
         clicked`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            expect(gameImage).toBeInTheDocument();
        });
    });
    describe("The Selection Box...", () => {
        test("Should not exist on the page before the game has started", () => {
            renderComponent();
            const selectionBox = screen.queryByRole("generic", { name: "selection-area" });
            expect(selectionBox).toBeNull();
        });
        test(`Should not exist on the page when the 'Start Game' button has just
         been clicked`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const selectionBox = screen.queryByRole("generic", { name: "selection-area" });
            expect(selectionBox).toBeNull();
        });
        test(`Should be present when the game has started and the game image is
         clicked`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const selectionBox = screen.getByRole("generic", { name: "selection-area" });
            expect(selectionBox).toBeInTheDocument();
        });
        test(`If it is present, it should be removed when the game image is
         clicked`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const selectionBox = screen.getByRole("generic", { name: "selection-area" });
            await user.click(gameImage);
            expect(selectionBox).not.toBeInTheDocument();
        });
    });
    describe("The Characters Drop Down Box...", () => {
        test("Should not exist on the page before the game has started", () => {
            renderComponent();
            const charSelectionBox = screen.queryByRole("list", { name: "character-selection-box" });
            expect(charSelectionBox).toBeNull();
        });
        test(`Should not exist on the page when the 'Start Game' button has just
         been clicked`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const charSelectionBox = screen.queryByRole("list", { name: "character-selection-box" });
            expect(charSelectionBox).toBeNull();
        });
        test(`Should be present when the game has started and the game image is
         clicked`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const charSelectionBox = screen.getByRole("list", { name: "character-selection-box" });
            expect(charSelectionBox).toBeInTheDocument();
        });
        test(`If it is present, it should be removed when the game image is
         clicked`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const charSelectionBox = screen.getByRole("list", { name: "character-selection-box" });
            await user.click(gameImage);
            expect(charSelectionBox).not.toBeInTheDocument();
        });
        test(`If it is present, should have the same number of options as
         characters remaining`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const charSelectionOptions = screen.getAllByRole("listitem", { name: "character-selection-option" });
            expect(charSelectionOptions.length).toBe(characters.length);
        });
        /*
            This test is currently broken - passing click event options with
            userEvent (e.g. - clientX and clientY) is not working as of writing
            this (user-event v14.5.1)

        test(`Clicking one of the options should call the
         'postCharacterSelection' API function, with the character name and
         click position as the arguments`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            const imagePos = [100, 100];
            Element.prototype.getBoundingClientRect = vi.fn(() => {
                return { 
                    x: 0,
                    y: 0,
                    bottom: 0,
                    height: imageSize[1],
                    left: imagePos[0],
                    right: 0,
                    top: imagePos[1],
                    width: imageSize[0]
                }
            });
            const a = await user.click(gameImage, {ctrlKey: true});
            const charSelectionOptions = screen.getAllByRole("listitem", { name: "character-selection-option" });
            const postCharacterSelectionSpy = vi.spyOn(fetchAPI, "postCharacterSelection");
            await user.click(charSelectionOptions[0]);
            expect(postCharacterSelectionSpy).toHaveBeenCalledWith("1",
                [Math.floor(imageSize[0] / 2) - imagePos[0], Math.floor(imageSize[1] / 2) - imagePos[1]]
            );
        });
        */
        test(`Should be closed after an option is selected, regardless of the
         outcome of the click`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const charSelectionBox = screen.getByRole("list", { name: "character-selection-box" });
            const charSelectionOptions = screen.getAllByRole("listitem", { name: "character-selection-option" });
            await user.click(charSelectionOptions[0]);
            expect(charSelectionBox).not.toBeInTheDocument();
        });
        test(`Should not contain any characters that have been successfully
        selected`, async () => {
            const user = userEvent.setup();
            postCharacterSelection.mockReturnValueOnce({
                ...characterSelectionResponse,
                charactersFound: [{
                    id: "1",
                    position: [0, 0],
                    width: 0,
                    height: 0,
                }]
            });
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const charSelectionOptions = screen.getAllByRole("listitem", { name: "character-selection-option" });
            expect(charSelectionOptions[0].textContent).toBe("1");
            await user.click(charSelectionOptions[0]);
            await user.click(gameImage);
            const charSelectionOptionsNew = screen.getAllByRole("listitem", { name: "character-selection-option" });
            expect(charSelectionOptionsNew[0].textContent).not.toBe("1");
        });
    });
    describe("A 'successful click area'...", () => {
        test("Should be displayed for each character found", async () => {
            const user = userEvent.setup();
            postCharacterSelection.mockReturnValueOnce({
                ...characterSelectionResponse,
                charactersFound: [{
                    id: "1",
                    position: [0, 0],
                    width: 0,
                    height: 0,
                }]
            });
            await startGame(user);
            let successfulClickAreas = screen.queryAllByRole("generic", { name: "successful-click-area" });
            expect(successfulClickAreas.length).toBe(0);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const charSelectionOptions = screen.getAllByRole("listitem", { name: "character-selection-option" });
            await user.click(charSelectionOptions[0]);
            successfulClickAreas = screen.getAllByRole("generic", { name: "successful-click-area" });
            expect(successfulClickAreas.length).toBe(1);
        })
    });
    describe("The 'selection response message'...", () => {
        test(`Should be displayed whenever a character is selected from the drop
         down box`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            let selectionResponseMessage = screen.queryByRole("heading", { name: "selection-response-message" });
            expect(selectionResponseMessage).toBeNull();
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const charSelectionOptions = screen.getAllByRole("listitem", { name: "character-selection-option" });
            await user.click(charSelectionOptions[0]);
            selectionResponseMessage = screen.getByRole("heading", { name: "selection-response-message" });
            expect(selectionResponseMessage).toBeInTheDocument();
         });
    });
    describe("The 'congratulations' message...", () => {
        test("Should be displayed when the last character is selected", async () => {
            const user = userEvent.setup();
            getGameInformation.mockReturnValueOnce({
                ...getGameInformationResponse,
                gameInfo: {
                    ...getGameInformationResponse.gameInfo,
                    characters: [{
                        id: "1",
                        name: "1",
                        imageUrl: null
                    }],
                }
            });
            postCharacterSelection.mockReturnValueOnce({
                ...characterSelectionResponse,
                charactersFound: [{
                    id: "1",
                    position: [0, 0],
                    width: 0,
                    height: 0,
                }]
            });
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            let congratulationsMessage = screen.queryByRole("heading", { name: "congratulations-message" });
            expect(congratulationsMessage).toBeNull();
            const charSelectionOptions = screen.getAllByRole("listitem", { name: "character-selection-option" });
            await user.click(charSelectionOptions[0]);
            congratulationsMessage = screen.getByRole("heading", { name: "congratulations-message" });
            expect(congratulationsMessage).toBeInTheDocument();
        });
    });
    describe("The 'game duration'...", () => {
        test("Should be displayed when the game is won", async () => {
            const user = userEvent.setup();
            getGameInformation.mockReturnValueOnce({
                ...getGameInformationResponse,
                gameInfo: {
                    ...getGameInformationResponse.gameInfo,
                    characters: [{
                        id: "1",
                        name: "1",
                        imageUrl: null
                    }],
                }
            });
            postCharacterSelection.mockReturnValueOnce({
                ...characterSelectionResponse,
                charactersFound: [{
                    id: "1",
                    position: [0, 0],
                    width: 0,
                    height: 0,
                }],
            });
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            let gameDuration = screen.queryByRole("heading", { name: "game-duration" });
            expect(gameDuration).toBeNull();
            const charSelectionOptions = screen.getAllByRole("listitem", { name: "character-selection-option" });
            await user.click(charSelectionOptions[0]);
            gameDuration = screen.getByRole("heading", { name: "game-duration" });
            expect(gameDuration).toBeInTheDocument();
        });
    });
    describe("The 'Submit to High-Scores button", () => {
        test("Should be displayed when the game is won", async () => {
            const user = userEvent.setup();
            getGameInformation.mockReturnValueOnce({
                ...getGameInformationResponse,
                gameInfo: {
                    ...getGameInformationResponse.gameInfo,
                    characters: [{
                        id: "1",
                        name: "1",
                        imageUrl: null
                    }],
                }
            });
            postCharacterSelection.mockReturnValueOnce({
                ...characterSelectionResponse,
                charactersFound: [{
                    id: "1",
                    position: [0, 0],
                    width: 0,
                    height: 0,
                }]
            });
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            let submitToHighScoresButton = screen.queryByRole("button", { name: "submit-to-high-scores-button" });
            expect(submitToHighScoresButton).toBeNull();
            const charSelectionOptions = screen.getAllByRole("listitem", { name: "character-selection-option" });
            await user.click(charSelectionOptions[0]);
            submitToHighScoresButton = screen.getByRole("button", { name: /Submit to High-Scores/i });
            expect(submitToHighScoresButton).toBeInTheDocument();
        });
        test("Should display the HighScoreForm component when clicked", async () => {
            const user = userEvent.setup();
            getGameInformation.mockReturnValueOnce({
                ...getGameInformationResponse,
                gameInfo: {
                    ...getGameInformationResponse.gameInfo,
                    characters: [{
                        id: "1",
                        name: "1",
                        imageUrl: null
                    }],
                }
            });
            postCharacterSelection.mockReturnValueOnce({
                ...characterSelectionResponse,
                charactersFound: [{
                    id: "1",
                    position: [0, 0],
                    width: 0,
                    height: 0,
                }]
            });
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const charSelectionOptions = screen.getAllByRole("listitem", { name: "character-selection-option" });
            await user.click(charSelectionOptions[0]);
            const submitToHighScoresButton = screen.getByRole("button", { name: /Submit to High-Scores/i });
            await user.click(submitToHighScoresButton);
            const highScoreFormComponent = screen.getByRole("generic", { name: "high-score-form" });
            expect(highScoreFormComponent).toBeInTheDocument();
        });
    });
    describe("The HighScoreForm component...", () => {
        test(`When correctly submitted, should invoke the
         postHighScoreSubmission function`, async () => {
            const user = userEvent.setup();
            getGameInformation.mockReturnValueOnce({
                ...getGameInformationResponse,
                gameInfo: {
                    ...getGameInformationResponse.gameInfo,
                    characters: [{
                        id: "1",
                        name: "1",
                        imageUrl: null
                    }],
                }
            });
            postCharacterSelection.mockReturnValueOnce({
                ...characterSelectionResponse,
                charactersFound: [{
                    id: "1",
                    position: [0, 0],
                    width: 0,
                    height: 0,
                }]
            });
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const charSelectionOptions = screen.getAllByRole("listitem", { name: "character-selection-option" });
            await user.click(charSelectionOptions[0]);
            const submitToHighScoresButton = screen.getByRole("button", { name: /Submit to High-Scores/i });
            await user.click(submitToHighScoresButton);
            const postHighScoreSubmissionSpy = vi.spyOn(fetchAPI, "postHighScoreSubmission");
            const submitButton = screen.getByRole("button", { name: "submit-high-score-from-form" });
            await user.click(submitButton);
            expect(postHighScoreSubmissionSpy).toHaveBeenCalledTimes(1);
        });
    });
});