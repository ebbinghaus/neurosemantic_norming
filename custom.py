# this file imports custom routes into the experiment server

from flask import Blueprint, render_template, request, jsonify, Response, abort, current_app
from jinja2 import TemplateNotFound
from functools import wraps
from sqlalchemy import or_, and_, Column, Integer, String, DateTime, Boolean, Float, Text, func
from sqlalchemy.orm import aliased

import random
import os
import numpy

from psiturk.psiturk_config import PsiturkConfig
from psiturk.experiment_errors import ExperimentError
from psiturk.user_utils import PsiTurkAuthorization, nocache

# # Database setup
from psiturk.db import Base, db_session, init_db
from psiturk.models import Participant
from json import dumps, loads
from custom_models import Word, Feature, Rating


# from random import shuffle
# from custom_models import Words, Features, WordXFeature, Ratings


# load the configuration options
config = PsiturkConfig()
config.load_config()
myauth = PsiTurkAuthorization(config)  # if you want to add a password protect route use this

# explore the Blueprint
custom_code = Blueprint('custom_code', __name__, template_folder='templates', static_folder='static')


###########################################################
#  serving warm, fresh, & sweet custom, user-provided routes
#  add them here
###########################################################

def log_print(stuff_to_print):
    current_app.logger.info(stuff_to_print)

#----------------------------------------------
# example custom route
#----------------------------------------------
@custom_code.route('/my_custom_view')
def my_custom_view():
	try:
		return render_template('custom.html')
	except TemplateNotFound:
		abort(404)

#----------------------------------------------
# example using HTTP authentication
#----------------------------------------------
@custom_code.route('/my_password_protected_route')
@myauth.requires_auth
def my_password_protected_route():
	try:
		return render_template('custom.html')
	except TemplateNotFound:
		abort(404)

#----------------------------------------------
# example accessing data
#----------------------------------------------
@custom_code.route('/view_data')
@myauth.requires_auth
def list_my_data():
        users = Participant.query.all()
	try:
		return render_template('list.html', participants=users)
	except TemplateNotFound:
		abort(404)


def chunks(l, n):
    return [l[i:i+n] for i in range(0, len(l), n)]


# Stimulus details:
# Check the sql tables for which which words have been rated. Construct stimuli (a word, it's sentence or definition, and features to rate)
# and return in all_trials.
def get_exp_trials(subject_id, nFeats, nTrials):
    # Construct nTrials, each with nFeats, checking whether subject_id has already contributed ratings
    myratings = db_session.query(Rating).filter(Rating.subject_id==subject_id).subquery()
    candidate_words = db_session.query(Word.index, Word.word_string, Word.word_definition, Word.rating_count, myratings.c.subject_id).outerjoin(myratings, Word.index==myratings.c.word_id).subquery()
    unique_words = db_session.query(candidate_words).filter(candidate_words.c.subject_id.is_(None)).subquery()
    minimum_count = db_session.query(func.min(unique_words.c.rating_count)).one()[0]
    min_unique_words = db_session.query(unique_words).filter(unique_words.c.rating_count == minimum_count).all()

    # if there aren't enough words with ratings == minimum_count fill out the set with the next min
    while len(min_unique_words) < nTrials:
        need_words = nTrials - len(min_unique_words)
        minimum_count += 1
        new_unique_words = db_session.query(unique_words).filter(unique_words.c.rating_count == minimum_count).all()
        if len(new_unique_words) > 0:
            pull_words = min(need_words, len(new_unique_words))
            append_words = random.sample(new_unique_words, pull_words)
            min_unique_words.extend(append_words)

    # --- get all words (nTrials) at once
    current_recs = random.sample(min_unique_words, nTrials)
    word_idx = 1 # position of words in current_recs
    def_idx = 2 # position of word definition in current_recs
    
    # Get features x nFeats for each of nTrials without looking at rating_counts
    all_feats = db_session.query(Feature.feature_string).all()

    all_trials = []
    for i in range(nTrials):
        feats = []
        n_random_features = random.sample(all_feats,nFeats)
        for feature in n_random_features:
            feats.append({'feat': feature[0]})
        trial = {'word': current_recs[i][word_idx],
                 'sentence': current_recs[i][def_idx],
                 'features': feats}        
        all_trials.append(trial)

    log_print(all_trials)
    return all_trials


#----------------------------------------------
# route to reload stimuli
# the javascript client will make a request to
# this route whenever it doesn't know what
# stimulus to display next.
#----------------------------------------------
# Get request from javascript, using participant unique id
# to check whether participant done any trials yet. If not, grab
# stimuli using call to get_exp_trials() and return jsonify'ed results
# to javascript.
# Note that using the sql calls and computing which trials etc is particular to
# this experiment.
@custom_code.route('/get_stims', methods=['GET'])
def get_stims():
    # check that user provided the correct keys
    # errors will not be that gracefull here if being
    # accessed by the Javascrip client
    if not request.args.has_key('uniqueId'):
        abort(400)
    uniqueId = request.args['uniqueId']

    try:

        total_trials = 0  # for demo sake just counting number of trials the user has completed so far
        # lookup user in database
        user = Participant.query.\
                filter(Participant.uniqueid == uniqueId).\
                one()
        user_data = loads(user.datastring) # load datastring from JSON
        for record in user_data['data']: # for line in data file
            trial = record['trialdata']
            if trial['phase'] == 'TEST': # if trial is a learning trial (e.g., not instructions)
                 total_trials += 1  

        current_app.logger.info(total_trials)
        if total_trials==0:
            trialset = get_exp_trials(uniqueId, 5, 20)
            return jsonify(results=trialset)
        else:
            return jsonify(results="done")
    except:
        abort(404)



# write some data back to the custom tables before finishing experiment
@custom_code.route('/complete_session', methods=['POST'])
def complete_session():
    if not 'trialdata' in request.form:
        abort(404)
    else:
        trialdata = loads(request.form['trialdata'])
        try:
            for trial in trialdata:
                log_print(trial)
                word_txt = trial['word']
                rt = trial['rt']
                features = trial['features']
                log_print(word_txt)

                # update word
                word = Word.query.filter(Word.word_string==word_txt).one()
                log_print(word.word_string)

                for feature_index in features.keys():
                    feature_name = features[feature_index]['feat']
                    log_print(feature_index)
                    log_print(feature_name)

                    # update feature
                    feature = Feature.query.filter(Feature.feature_string==feature_name).one()
                    log_print(feature.feature_string)
                    db_session.add(feature)

                    # record rating
                    myrating = Rating(word, feature, request.form['uniqueId'])
                    myrating.set_rating(float(features[feature_index]['rating'][:-1]))
                    log_print(request.form['uniqueId'])
                    
                    db_session.add(feature)
                    db_session.add(myrating)

            db_session.add(word)
            db_session.commit()
            log_print("saved")
        except:
            log_print("error saving")
            abort(404)
        else:
            return jsonify(status="saved")
