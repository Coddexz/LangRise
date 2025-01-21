from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain_core.prompt_values import PromptValue
from math import ceil


class StoryGenerator:
    def __init__(self, words: list[str], language_level: str, tone: str):
        """
        Initializes the StoryGenerator with required parameters.
        Args:
            words (list[str]): List of words to include in the story.
            language_level (str): Language proficiency level (e.g., B1, C1).
            tone (str): Tone of the story (e.g., Sad, Happy).
        """
        self.words = words
        self.language_level = language_level
        self.tone = tone
        self.model = ChatOpenAI(temperature=0.7)
        self.question_limit = 10
        self.sentence_limit = 30
        self.questions_count = self._calculate_questions_count()
        self.sentence_count = self._calculate_sentence_count()
        self.output_parser = self._initialize_output_parser()

    def _calculate_questions_count(self) -> int:
        """
        Calculates the number of questions to include based on the number of words.
        Returns:
            int: Number of questions.
        """
        word_count = ceil(len(self.words) / 10)
        if word_count < 3:
            return 3
        elif word_count < self.question_limit:
            return word_count
        else:
            return self.question_limit

    def _calculate_sentence_count(self) -> int:
        """
        Calculates the number of sentences to include based on the number of words.
        Returns:
            int: Number of sentences.
        """
        sentence_count = len(self.words)
        if sentence_count < 6:
            return 5
        elif sentence_count < self.sentence_limit:
            return sentence_count
        else:
            return self.sentence_limit

    def _initialize_output_parser(self) -> StructuredOutputParser:
        """
        Initializes the structured output parser.
        Returns:
            StructuredOutputParser: The parser for ChatGPT output.
        """
        response_schemas = [
            ResponseSchema(name="story", description="The generated story"),
            ResponseSchema(name="questions", description="Questions based on the story"),
            ResponseSchema(name="answers", description="Answers to the questions"),
        ]
        return StructuredOutputParser.from_response_schemas(response_schemas)

    def _prepare_prompt(self) -> PromptValue:
        """
        Prepares the prompt template for the story generation task.
        Returns:
            PromptTemplate: A template for constructing the story generation prompt.
        """
        template = """
Create a story using the following words: {words}. 

The story should meet the following criteria:
1. Language Level: {language_level}.
2. Tone: {tone}.
3. Length: The story should be no more than {sentence_count} sentences long and written in clear, concise language.
4. Format: Output the story as properly formatted HTML code. Ensure the HTML is clean, easy to read, and ready to paste into a webpage.

Additionally:
1. Include {questions_count} unique questions related to the story. Each question should test the understanding of a specific word from the list in context.
2. Provide the correct answers to these questions. The answers must be one of the following: "R" (True), "F" (False), or "N/A" (Not Mentioned).

Format the response as follows:
---
Story (in HTML):
<p>[Your beautifully formatted story here]</p>
---
Questions:
1. [Question 1]
2. [Question 2]
3. [Question 3]
---
Answers:
1. [Answer 1: R/F/N/A]
2. [Answer 2: R/F/N/A]
3. [Answer 3: R/F/N/A]
"""
        return PromptTemplate(
            input_variables=["words", "language_level", "tone", "sentence_count", "questions_count"],
            template=template,
            output_parser=self.output_parser,
        ).format_prompt(
            words="|".join(self.words),
            language_level=self.language_level,
            tone=self.tone,
            sentence_count=self.sentence_count,
            questions_count=self.questions_count,
        )

    def generate_story(self) -> dict:
        """
        Generates a story using the model based on the initialized parameters.
        Returns:
            dict: A structured response containing the story, questions, and answers.
        """
        prompt = self._prepare_prompt()
        response = self.model.invoke(prompt)
        return self.output_parser.parse(response.content)
