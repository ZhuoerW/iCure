import unittest
import HTMLTestRunner
import os
from test_successfully_login import SuccessfullyLogInTests
# get the directory path to output report file
dir = os.getcwd()
# get all tests from SearchProductTest and HomePageTest class

successfully_login_tests = unittest.TestLoader().loadTestsFromTestCase(SuccessfullyLogInTests)
# create a test suite combining search_test and home_pa ge_test
tests = unittest.TestSuite([successfully_login_tests])
# open the report file
outfile = open(dir + "/TestReport.html", "w")
# configure HTMLTestRunner options
runner = HTMLTestRunner.HTMLTestRunner(stream=outfile,title='Test Report', description='Tests')
# run the suite using HTMLTestRunner
runner.run(tests)