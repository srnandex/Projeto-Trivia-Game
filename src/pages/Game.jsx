import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import '../CSS/game.css';
import Header from '../components/Header';
import { saveScore } from '../actions';

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      questions: [],
      position: 0,
      answers: [],
      timer: 30,
      isDisabled: false,
      isAnswered: false,
    };
  }

  componentDidMount() {
    const { token } = this.props;
    const URL = `https://opentdb.com/api.php?amount=5&token=${token}`;

    fetch(URL)
      .then((response) => response.json())
      .then((data) => {
        const { results } = data;
        this.setState({
          questions: results,
        }, () => this.randomizeAnswers());
      });
    this.start();
  }

  componentWillUnmount() {
    const { interval } = this.state;
    clearInterval(interval);
  }

  start = () => {
    const second = 1000;
    const interval = setInterval(this.lessTimer, second);
    this.setState({ interval });
  }

  lessTimer = () => {
    this.setState((prevState) => ({ timer: prevState.timer - 1 }), () => {
      const { timer, interval } = this.state;
      if (timer === 0) {
        clearInterval(interval);
        this.setState({ isDisabled: true });
      }
    });
  }

  randomizeAnswers = () => {
    const { questions, position } = this.state;
    const {
      incorrect_answers: incorrectAnswers,
      correct_answer: correctAnswer,
    } = questions[position];
    const sortNumber = 0.5;
    const answers = [...incorrectAnswers, correctAnswer]
      .sort(() => Math.random() - sortNumber); // https://www.delftstack.com/pt/howto/javascript/shuffle-array-javascript/

    this.setState({
      answers,
    });
  }

  checkAnswer = ({ target }) => {
    const { timer } = this.state;
    const { saveScoreFunction } = this.props;
    this.setState({
      isAnswered: true,
    });
    const defaultScore = 10;
    let totalScore = 0;
    if (target.id === 'correct-answer') {
      switch (target.name) {
      case 'medium':
        totalScore += (defaultScore + (timer * 2));
        saveScoreFunction(totalScore);
        break;
      case 'hard':
        totalScore += (defaultScore + (timer * Number('3')));
        saveScoreFunction(totalScore);
        break;
      default:
        totalScore += (defaultScore + timer);
        saveScoreFunction(totalScore);
        break;
      }
    }
  }

  // 10 + (timer * dificuldade)
  // hard: 3, medium: 2, easy: 1

  nextQuestion = () => {
    const { questions, position } = this.state;
    const { history } = this.props;
    const nextPosition = position + 1;
    if (position === questions.length - 1) {
      history.push('/feedback');
    }
    this.setState({
      position: nextPosition,
      isAnswered: false,
      answers: [],
      timer: 30 }, () => this.randomizeAnswers());
  };

  render() {
    const { questions, position, answers, timer, isDisabled, isAnswered } = this.state;
    return (
      <div>
        <Header />
        { questions.length > 0 && (
          <div>
            <div>
              <div>
                <h2 data-testid="question-category">{ questions[position].category }</h2>
                <p data-testid="question-text">{ questions[position].question }</p>
              </div>
              <div data-testid="answer-options">
                { answers.map((answer, index) => (
                  answer === questions[position].correct_answer
                    ? (
                      <button
                        type="button"
                        data-testid="correct-answer"
                        id="correct-answer"
                        className={ isAnswered ? 'verde' : 'preto' }
                        onClick={ this.checkAnswer }
                        key={ index }
                        disabled={ isDisabled }
                        name={ questions[position].difficulty }
                      >
                        { answer }
                      </button>
                    )
                    : (
                      <button
                        type="button"
                        data-testid={ `wrong-answer-${index}` }
                        className={ isAnswered ? 'vermelho' : 'preto' }
                        onClick={ this.checkAnswer }
                        key={ index }
                        disabled={ isDisabled }
                      >
                        { answer }
                      </button>
                    )
                ))}
                <p>{ timer }</p>
                { isAnswered && (
                  <button
                    onClick={ this.nextQuestion }
                    data-testid="btn-next"
                    type="button"
                  >
                    Next
                  </button>) }
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

Game.propTypes = {
  token: PropTypes.string.isRequired,
  saveScoreFunction: PropTypes.func.isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
  token: state.token,
});

const mapDispatchToProps = (dispatch) => ({
  saveScoreFunction: (score) => dispatch(saveScore(score)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Game);
