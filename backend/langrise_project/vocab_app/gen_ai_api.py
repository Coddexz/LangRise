import logging
from math import ceil
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain_core.prompt_values import PromptValue

logging.basicConfig(level=logging.INFO)
load_dotenv()


class StoryGenerator:
    def __init__(
            self,
            words: list[str],
            language_level: str,
            tone: str,
            model_name: str = "gpt-4o",
            temperature: float = 0.7,
            max_input_tokens: int = 4096,
            max_output_tokens: int = 1000,
            question_limit: int = 10,
            sentence_limit: int = 30
    ):
        """
        Initializes the StoryGenerator with required parameters.

        Args:
            words (list[str]): List of words to include in the story.
            language_level (str): Language proficiency level (e.g., B1, C1).
            tone (str): Tone of the story (e.g., Sad, Happy).
            model_name (str, optional): Name of the language model to use. Defaults to 'gpt-4o-mini'.
            temperature (float, optional): Sampling temperature for model output. Defaults to 0.7.
            max_input_tokens (int, optional): The maximum number of tokens to include in the prompt. Defaults to 4096.
            max_output_tokens (int, optional): The maximum number of tokens to generate. Defaults to 1000.
            question_limit (int, optional): The maximum number of questions to include in the story. Defaults to 10.
            sentence_limit (int, optional): The maximum number of sentences to include in the story. Defaults to 30.
        """
        self.words = words
        self.language_level = language_level
        self.tone = tone

        self.model = ChatOpenAI(
            model_name=model_name,
            temperature=temperature,
            max_tokens=max_output_tokens,
        )

        self.question_limit = question_limit
        self.sentence_limit = sentence_limit
        self.max_input_tokens = max_input_tokens

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
            PromptValue: A PromptValue instance containing the final prompt.
        """
        template = """
        Return your answer in valid JSON with the keys: "story", "questions", and "answers". Include only those keys. Do not wrap your output in triple backticks.

        Create a story using the following words: {words}. The story must be in HTML format, use up to {sentence_count} sentences, reflect a {tone} tone, and match a {language_level} language level. Each sentence should be clear and concise.

        After the story, create {questions_count} statements about the story. Each question must focus on the understanding and usage of a specific word from the list within the story's context. Each statement must be answerable with "R" (True), "F" (False), or "N/A" (Not Mentioned). If it's not in the story, the correct answer is "N/A".

        Example output format (JSON only, without triple backticks):

        {{
          "story": "<p>...</p>",
          "questions": "1. Statement\\n2. Statement\\n...",
          "answers": "1. R\\n2. F\\n..."
        }}
                """.strip()

        prompt_template = PromptTemplate(
            input_variables=["words", "language_level", "tone", "sentence_count", "questions_count"],
            template=template,
            output_parser=self.output_parser,
        )

        return prompt_template.format_prompt(
            words="|".join(self.words),
            language_level=self.language_level,
            tone=self.tone,
            sentence_count=self.sentence_count,
            questions_count=self.questions_count,
        )

    def _validate_token_limit(self, prompt: str, max_tokens: int) -> None:
        """
        Validates that the total token usage of the prompt and response does not exceed the model's token limit.

        Args:
            prompt (str): The prepared prompt to be sent to the model.
            max_tokens (int): The maximum allowable token count.

        Raises:
            ValueError: If the estimated token usage exceeds the max_tokens limit.
        """
        # Approximate token count for the prompt (1 token per 4 characters is a rough estimate)
        prompt_token_count = len(prompt) // 4
        estimated_total_tokens = prompt_token_count + self.model.max_tokens

        if estimated_total_tokens > max_tokens:
            raise ValueError(
                f"Request exceeds the maximum allowed token limit of {max_tokens}. "
                f"Estimated total tokens: {estimated_total_tokens}."
            )

    def generate_story(self) -> dict:
        """
        Generates a story using the model based on the initialized parameters.

        Returns:
            dict: A structured response containing the story, questions, and answers.
                  Example:
                  {
                      "story": "<p>Your story...</p>",
                      "questions": "1. ... 2. ...",
                      "answers": "1. R 2. F ..."
                  }
        """
        prompt = self._prepare_prompt()

        self._validate_token_limit(prompt.to_string(), self.max_input_tokens)

        logging.info("Invoking the language model with the prepared prompt...")

        try:
            response = self.model.invoke(prompt)
            logging.info('Parsing the model response...')
        except Exception as e:
            logging.error(f"Error invoking the model: {e}")
            raise RuntimeError("Model invocation failed.") from e

        structured_response = self.output_parser.parse(response.content)

        return structured_response


# Example usage:
if __name__ == "__main__":
    words = ["apple", "journey", "music", "river", "friendship", "company", "arrival", "aspirin", "assist", "corn", "cute"]
    generator = StoryGenerator(words, "B1", "Inspiring")
    result = generator.generate_story()


    print("Story:\n", result["story"])
    print("Questions:\n", result["questions"])
    print("Answers:\n", result["answers"])

    import json
    with open("story.json", "w") as f:
        json.dump(result, f, indent=4)
