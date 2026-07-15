## TODOs
I want to make webbased map generator for a future game. The map is made out of hexes. I want to be able to define parameters such as horizontal and vertical tile count, the center of the map, the seed, etc. The map should then be generated in the center of the screen. There should be sliders to adjust the parameters. It should be able to toggle a heagonal grid on and off. Possible to auto generate a map with specified parameters or create the map manually. The bounding rect of the hexagonal tiles is of size 128x110. The tiles that build up the map are available in the folder game tiles. The middle tile of the first and last of the vertical rows should be a "Wizards Tower L1" tile. Thats where each player starts.

I want to make webbased card generator for a future game. The card should be identical to a playing card from "Magic the gathering", the card game. It should include the name of the card, the mana cost, the card type, the card text, and the card art. There should be input fields for each of these properties. The card should be generated in the center of the screen. It should have two buttons one for "generate" and one for "clear". It should also include the ability to save the card as an image. It should be possible to save and load all cards. All generated cards are added to a list called a deck. There should be possible to delete a card from the deck.There should be parameters to describe how the card should look and specify all texts. Parameters for the card:
- Frame color
- Name/Title
- Mana cost (icons for Mountain, Swamp, Plain or Forrest)
- Type (Artifact, Creature, Enchantment, Land, spell, Tower)
- Card text (textbox for text)
- Card art (drop area for the art)



## Later maybe



## Done
~~Can you write a python program that extracts the inner hexagon shapes from the .png files in the folder concept_art, without the border and make sure they are all the same size? Make the background transparent. I want to be able to use them as assets in my game and save them in a folder called "game tiles".~~
- The map should be able to export a svg image. 
