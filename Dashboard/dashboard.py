# dependencies:
import os
import glob
import json
import math
import sys
import visdom
import dropbox
import argparse
import time, datetime
import numpy as np


# set up connection to Visdom
vis=visdom.Visdom()


# set up connection to Dropbox:
# Dropbox account: use fetschlab@gmail.com to log in
# Do not share the dropbox key with anyone: it allows to read and write to the
# dropbox account without any further login!
dbxkey='KRQ60jwJHuAAAAAAAAAACnWWgJ5vQEnGcZ2JwWTAbcbVTdoCLc1rLrLOldzJMfr-'
dbx=dropbox.Dropbox(dbxkey)


# check if folder exists:
def pathexists(path):
    try:
        metadata=dbx.files_get_metadata(path)
        exists=True
    except:
        exists=False
    return exists


# helper function for getting file / folder lists:
def _getfilefolderlist(folder=None, cursor=None, isfile=True, extension=''):
    filefolderlist=[]
    assert (folder is None or cursor is None), 'specify folder or cursor'
    iterator=dbx.files_list_folder(folder).entries if cursor is None else \
             dbx.files_list_folder_continue(cursor).entries
    for entry in iterator:
        if (not isfile and type(entry) == dropbox.files.FolderMetadata) or \
               (isfile and type(entry) == dropbox.files.FileMetadata and entry.name.endswith(extension)):
            filefolderlist.append(entry.name)
    return filefolderlist


# get list of all folders:
def getfolderlist(folder=None, cursor=None):
    return _getfilefolderlist(folder=folder, cursor=cursor, isfile=False)


# get list of all JSON files:
def getfilelist(folder=None, cursor=None):
    return _getfilefolderlist(folder=folder, cursor=cursor, isfile=True, \
            extension='.json')


# get cursor on folder:
def getcursor(folder):
    return dbx.files_list_folder_get_latest_cursor(folder).cursor


# read JSON file from Dropbox:
def readjson(folder, filename):
    md,res=dbx.files_download('%s/%s' % (folder, filename))
    return json.loads(res.content)


# process a set of JSON files:
def processjsonfiles(folder, filelist):

    # allocate buffers:
    unixtime=np.empty([len(filelist)])
    accuracy=np.empty([len(filelist)])
    reactiontime=np.empty([len(filelist)])

    # read all JSON files:
    cnt=0
    for filename in filelist:
        contents=readjson(folder, filename)
        unixtime[cnt]=contents['unixTime'] / 1000
        accuracy[cnt]=contents['accuracy']
        reactiontime[cnt]=contents['goRT']
        cnt=cnt+1
    return unixtime, accuracy, reactiontime


# compute timestamp corresponding to start of current date:
def getstartofday(timestamp):
    tsdate=datetime.date.fromtimestamp(timestamp)
    startofday=datetime.date(tsdate.year, tsdate.month, tsdate.day)
    return time.mktime(startofday.timetuple())


# make pretty date label:
def prettydatelabel(date):
    if len(date) >= 8:
        return date[0:4] + '-' + date[4:6] + '-' + date[6:8]
    return date


# make pretty time label:
def prettytimelabel(value, numvalues):
    seconds=value * 3600
    now=datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    t=now + datetime.timedelta(seconds=seconds)
    return t.strftime('%H:%M')


# function that draws/updates plots for a particular folder:
def drawdashboardplot(monkey, date, unixtime, accuracy, reactiontime):

    # compute number of trials per time period:
    binwidth=600  # granularity of plot in seconds
    daystart=getstartofday(unixtime[0])
    dayend=min(time.time(), daystart + 24 * 3600 - 1)
    numtrials=np.histogram(
        unixtime,
        bins=math.ceil((dayend - daystart) / binwidth),
        range=(daystart, dayend),
    )[0]

    # compute number of correct trials per time period:
    numcorrecttrials=np.histogram(
        unixtime[accuracy == 1],
        bins=math.ceil((dayend - daystart) / binwidth),
        range=(daystart, dayend),
    )[0]

    # generate x-axis time labels:
    hour=numtrials.size * binwidth / 3600.0
    xtickvals=[]
    xticklabels=[]
    for i in range(0, int(math.ceil(hour)), 5):
        xtickvals.append(i)
        xticklabels.append(prettytimelabel(i, hour))

    # draw plot for monkey on main dashboard:
    vis.line(
        Y=np.c_[numtrials, numcorrecttrials],
        X=np.arange(0, hour, hour / numtrials.size),
        env='main',
        win=monkey,
        opts=dict(
            title='%s (%s; %d trials)' % (monkey, date, unixtime.size),
            xlabel='Time of day',
            ylabel='Number of trials',
            legend=['All', 'Correct'],
            xtickvals=xtickvals,
            xticklabels=xticklabels,
            #width=600,
            #height=400,
        ),
    )

# draw accuracy and reaction time plots on monkey overview:
def drawmonkeyplot(monkey, date, unixtime, accuracy, reactiontime):

    # accuracy plot:
    title='%s; %2.1f %% correct' % (date, np.mean(accuracy) * 100)
    vis.line(
        Y=accuracy,
        X=np.arange(0, accuracy.size),
        env=monkey,
        win=monkey + '_accuracy',
        opts=dict(
            title=title,
            xlabel='Trial number',
            ylabel='Accuracy (in %)',
            #width=600,
            #height=400,
        ),
    )

    # reaction time plot:
    title='%s; mean = %2.2f ms' % (date, np.mean(reactiontime))
    vis.line(
        Y=reactiontime,
        X=np.arange(0, reactiontime.size),
        env=monkey,
        win=monkey + '_reactiontime',
        opts=dict(
            title=title,
            xlabel='Trial number',
            ylabel='Reaction time (in ms)',
            #width=600,
            #height=400,
        ),
    )


# draw all plots:
def drawallplots(monkey, date, unixtime, accuracy, reactiontime):
    drawdashboardplot(
        monkey=monkey,
        date=date,
        unixtime=unixtime,
        accuracy=accuracy,
        reactiontime=reactiontime,
    )
    drawmonkeyplot(
        monkey=monkey,
        date=date,
        unixtime=unixtime,
        accuracy=accuracy,
        reactiontime=reactiontime,
    )


# create dashboard:
def dashboard(monkey=None, folder=None, update=True):

    # check that we have a monkey if a folder is specified:
    monkeyspecified=True if monkey else False
    folderspecified=True if folder else False
    if folderspecified and not monkeyspecified:
        print 'You must specify a monkey when specifying a folder.'
        sys.exit(0)
    if monkeyspecified:  # do not update when monkey / date specified
        update=False

    # create dictionaries for data:
    folders, trialcursors, foldercursors = dict(), dict(), dict()
    unixtimes, accuracies, reactiontimes, folderlabels = dict(), dict(), dict(), dict()

    # get current date:
    today=datetime.date.today().strftime('%Y%m%d')

    # loop over monkeys:
    print 'Constructing initial visualizations...'
    monkeys=[monkey] if monkey else getfolderlist(folder='')
    monkeylist=list(monkeys)  # to facilitate removal of "empty" monkeys???
    for monkey in monkeylist:

        # check that specified folder exists:
        if folder is not None:
            folderlabels[monkey]=folder
            folders[monkey]='/%s/%s' % (monkey, folder)
            if not pathexists(folders[monkey]):
                print 'Folder %s does not exist.' % folders[monkey]
                sys.exit(0)

        # find the last date:
        else:
            dates=getfolderlist(folder='/%s' % monkey)
            if len(dates) == 0:
                print 'No data for monkey %s found. Ignoring monkey.' % monkey
                monkeys.remove(monkey)
                continue

            dates.sort()
            date=dates[len(dates) - 1]
            folders[monkey]='/%s/%s' % (monkey, date)
            folderlabels[monkey]=prettydatelabel(date)

        # get file list:
        filelist=getfilelist(folder=folders[monkey])

        # read data:
        unixtimes[monkey], accuracies[monkey], reactiontimes[monkey] = \
                processjsonfiles(folders[monkey], filelist)

        # draw plot (only plot on dashboard when no specific trials specified):
        if not monkeyspecified and not folderspecified:
            drawdashboardplot(
                monkey=monkey,
                date=folderlabels[monkey],
                unixtime=unixtimes[monkey],
                accuracy=accuracies[monkey],
                reactiontime=reactiontimes[monkey],
            )
        drawmonkeyplot(
            monkey=monkey,
            date=folderlabels[monkey],
            unixtime=unixtimes[monkey],
            accuracy=accuracies[monkey],
            reactiontime=reactiontimes[monkey],
        )

        # get cursor on folder:
        if update:
            trialcursors[monkey]=getcursor(folders[monkey])
            foldercursors[monkey]=getcursor('/' + monkey)

    # perform continuous updating of folders:
    if update:
        timestep=10  # seconds between update
        print ('Updating visualizations every %d seconds...') % timestep
        while True:

            # wait for a few seconds between updates:
            time.sleep(timestep)
            for monkey in monkeys:
                updateplot=False

                # check for new folder to see if data for new date available:
                if not folderspecified:
                    newfolders=getfolderlist(cursor=foldercursors[monkey])
                    if len(newfolders) > 0:

                        # update folder name and date label:
                        date=newfolders[len(newfolders) - 1]
                        folders[monkey]='/%s/%s' % (monkey, date)
                        folderlabels[monkey]=prettydatelabel(date)

                        # read data from new folder:
                        filelist=getfilelist(folder=folders[monkey])
                        unixtimes[monkey], accuracies[monkey], reactiontimes[monkey] = \
                                processjsonfiles(folders[monkey], filelist)

                        # update cursors:
                        foldercursors[monkey]=getcursor('/' + monkey)
                        trialcursors[monkey]=getcursor(folders[monkey])
                        updateplot=True

                # get new files:
                newfiles=getfilelist(cursor=trialcursors[monkey])
                trialcursors[monkey]=getcursor(folders[monkey])
                if len(newfiles) > 0:

                    # read new data:
                    unixtime, accuracy, reactiontime = \
                            processjsonfiles(folders[monkey], newfiles)
                    unixtimes[    monkey] = np.r_[unixtimes[    monkey], unixtime]
                    accuracies[   monkey] = np.r_[accuracies[   monkey], accuracy]
                    reactiontimes[monkey] = np.r_[reactiontimes[monkey], reactiontime]
                    updateplot=True

                # update plots if needed:
                if updateplot:
                    drawallplots(
                        monkey=monkey,
                        date=folderlabels[monkey],
                        unixtime=unixtimes[monkey],
                        accuracy=accuracies[monkey],
                        reactiontime=reactiontimes[monkey],
                    )
    else:
        print('Done!')


# start dashboard:
if __name__ == '__main__':

    # parse input arguments:
    parser = argparse.ArgumentParser(description='Start the monkey dashboard.')
    parser.add_argument('-monkey', dest='monkey', type=str,
        help='name of the monkey to visualize')
    parser.add_argument('-folder', dest='folder', type=str,
        help='name of the folder to visualize')
    parser.add_argument('-noupdate', dest='noupdate', default=False,
        help='do not update the plot continuously', action='store_true')
    args = parser.parse_args()

    # start dashboard:
    dashboard(args.monkey, args.folder, not args.noupdate);
