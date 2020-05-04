INSERT INTO BANK
    (name)
VALUES
    ('Bank of America'),
    ('Ally Bank'),
    ('BB&T BANK'),
    ('BBVA Compass'),
    ('Capital One Bank'),
    ('Citibank'),
    ('Citizens Bank'),
    ('Fifth Third Bank'),
    ('Wells Fargo Bank'),
    ( 'Wells Fargo Bank'),
    ('US Bank'),
    ('USAA'),
    ('HSBC Bank USA'),
    ('HSBC Bank USA'),
    ('J.P Morgan Chase Bank'),
    ('KeyBank'),
    ('Kinetic Credit Union'),
    ('Navy Federal Credit Union'),
    ('PNC Bank'),
    ('Regions Bank'),
    ('Sun Trust Bank'),
    ( 'TD Bank');


INSERT INTO COUNTRY
    (name)
VALUES
    ('UNITED STATES'),
    ('VENEZUELA');


INSERT INTO LANGUAGE
    (name)
VALUES
    ('en'),
    ('es');


INSERT INTO PLATFORM_INTEREST
    (name, percentage,amount)
VALUES
    ('Premium Extra', 20, null),
    ( 'Gold Extra', 20, 5000),
    ('Verification Interest', null, 250),
    ('Buy Interest', 1.5, null),
    ('Withdrawal Interest', 5, null);


INSERT INTO POINTS_CONVERSION
    (one_point_equals_dollars)
VALUES
    (0.002);

INSERT INTO ROLE
    (name)
VALUES
    ('ADMINISTRATOR'),
    ('CLIENT');

INSERT INTO STATE
    (name, description)
VALUES
    ('ACTIVE', 'This state indicates that the object is ready to be used'),
    ('VERIFYING', 'This state indicates that the object is in the verification process'),
    ('BLOCKED', 'This state indicates that the object has been disabled'),
    ('CANCELED', 'This state indicates that the object cant be used'),
    ('VALID', 'This state indicates that the transaction has been made successful'),
    ('INVALID', 'This state indicates that the transaction has not been made successful');


INSERT INTO SUSCRIPTION
    (name, cost, upgraded_amount, description)
VALUES
    ('BASIC', 0, null, 'Suscription initial of every new client'),
    ('PREMIUM', 2500, null, 'User must to ask for this suscription'),
    ('GOLD', 0, 15000, 'This suscription is active when the user has spend an amount greater or equal to upgraded_amount');



INSERT INTO THIRD_PARTY_INTEREST
    (payment_provider,name, amount_dollar_cents)
VALUES
    ('STRIPE', 'Transaction Interest', 75);

